from datetime import timedelta
from decimal import Decimal
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Avg, Count, DecimalField, ExpressionWrapper, F, Q, Sum
from django.db.models.functions import Coalesce, TruncDate
from django.utils import timezone
from rest_framework import generics
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import AllowAny, BasePermission
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer
from apps.orders.models import OrderItem


def is_approved_seller(user):
    if not user or not user.is_authenticated:
        return False
    if user.is_staff:
        return True
    if user.role != "seller":
        return False
    try:
        return user.seller_application.status == "approved"
    except ObjectDoesNotExist:
        return False

class SellerOrAdmin(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return is_approved_seller(user)
    def has_object_permission(self, request, view, obj):
        user = request.user
        return bool(user.is_staff or obj.seller_id == user.id)

class ProductPagination(PageNumberPagination):
    page_size = 24
    page_size_query_param = "page_size"
    max_page_size = 100

class ProductListView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    pagination_class = ProductPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ["name", "name_ar", "description", "description_ar", "brand", "sku"]
    ordering_fields = ["effective_price", "created_at", "stock", "name"]
    ordering = ["-created_at"]
    def get_permissions(self):
        return [AllowAny()] if self.request.method == "GET" else [SellerOrAdmin()]
    def get_queryset(self):
        qs = Product.objects.prefetch_related("categories").annotate(effective_price=Coalesce("discount_price", "price", output_field=DecimalField(max_digits=10, decimal_places=2)))
        user = self.request.user
        if not user.is_staff:
            if user.is_authenticated and user.role == "seller":
                qs = qs.filter(Q(is_approved=True) | Q(seller=user))
            else:
                qs = qs.filter(is_approved=True)
        params = self.request.query_params
        if params.get("mine") == "true" and self.request.user.is_authenticated and self.request.user.role == "seller":
            qs = qs.filter(seller=self.request.user)
        category = params.get("category")
        if category:
            qs = qs.filter(categories__slug=category)
        brand = params.get("brand")
        if brand:
            qs = qs.filter(brand__icontains=brand.strip())
        low, high = params.get("min_price"), params.get("max_price")
        if low:
            qs = qs.filter(effective_price__gte=low)
        if high:
            qs = qs.filter(effective_price__lte=high)
        if params.get("in_stock") == "true":
            qs = qs.filter(stock__gt=0)
        return qs.distinct()
    def perform_create(self, serializer):
        serializer.save(seller=self.request.user, is_approved=self.request.user.is_staff, is_featured=False)

class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductSerializer
    lookup_field = "slug"
    def get_permissions(self):
        return [AllowAny()] if self.request.method == "GET" else [SellerOrAdmin()]
    def get_queryset(self):
        qs = Product.objects.prefetch_related("categories").annotate(effective_price=Coalesce("discount_price", "price", output_field=DecimalField(max_digits=10, decimal_places=2)))
        user = self.request.user
        if user.is_staff:
            return qs
        if user.is_authenticated and user.role == "seller":
            return qs.filter(Q(is_approved=True) | Q(seller=user))
        return qs.filter(is_approved=True)
    def retrieve(self, request, *args, **kwargs):
        product = self.get_object()
        payload = self.get_serializer(product).data
        related = Product.objects.filter(is_approved=True, categories__in=product.categories.all()).exclude(pk=product.pk).distinct()[:8]
        payload["related"] = ProductSerializer(related, many=True, context=self.get_serializer_context()).data
        payload["reviews"] = []
        return Response(payload)

class CategoryListAPIView(generics.ListAPIView):
    permission_classes = [AllowAny]
    pagination_class = None
    queryset = Category.objects.all().order_by("name")
    serializer_class = CategorySerializer


class SellerDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated, SellerOrAdmin]

    def get(self, request):
        user = request.user
        products = Product.objects.filter(seller=user)
        now = timezone.now()
        since = now - timedelta(days=30)
        previous_since = since - timedelta(days=30)
        lines = OrderItem.objects.filter(product__seller=user).exclude(order__status="cancelled")
        recent = lines.filter(order__created_at__gte=since)
        previous = lines.filter(order__created_at__gte=previous_since, order__created_at__lt=since)
        value_expr = ExpressionWrapper(F("price") * F("quantity"), output_field=DecimalField(max_digits=14, decimal_places=2))

        def totals(queryset):
            result = queryset.aggregate(
                revenue=Sum(value_expr),
                units=Sum("quantity"),
                orders=Count("order_id", distinct=True),
            )
            return {
                "revenue": float(result["revenue"] or 0),
                "units": int(result["units"] or 0),
                "orders": int(result["orders"] or 0),
            }

        current_totals = totals(recent)
        previous_totals = totals(previous)
        daily_map = {
            row["day"].isoformat(): float(row["revenue"] or 0)
            for row in recent.annotate(day=TruncDate("order__created_at"))
            .values("day")
            .annotate(revenue=Sum(value_expr))
            .order_by("day")
        }
        daily_sales = []
        for offset in range(29, -1, -1):
            day = (now - timedelta(days=offset)).date().isoformat()
            daily_sales.append({"date": day, "revenue": daily_map.get(day, 0)})

        top_lines = (
            recent.values("product_id", "product__name", "product__slug")
            .annotate(units=Sum("quantity"), revenue=Sum(value_expr))
            .order_by("-units")[:5]
        )
        top_products = [
            {"id": row["product_id"], "name": row["product__name"], "slug": row["product__slug"], "units": int(row["units"] or 0), "revenue": float(row["revenue"] or 0)}
            for row in top_lines
        ]

        # Explainable seller recommendations based on order history and available stock.
        # These are decision aids, not profit forecasts: traffic, returns and unit cost
        # are not currently recorded by the marketplace.
        current_by_product = {
            row["product_id"]: int(row["units"] or 0)
            for row in recent.values("product_id").annotate(units=Sum("quantity"))
        }
        previous_by_product = {
            row["product_id"]: int(row["units"] or 0)
            for row in previous.values("product_id").annotate(units=Sum("quantity"))
        }
        product_actions = {"increase_stock": [], "improve": [], "pause_candidates": []}
        active_products = list(products.filter(is_approved=True).prefetch_related("categories").order_by("name"))
        category_ids = {category.id for product in active_products for category in product.categories.all()}
        category_averages = {}
        if category_ids:
            category_averages = {
                row["categories__id"]: row["average"]
                for row in Product.objects.filter(is_approved=True, categories__id__in=category_ids)
                .annotate(effective_price=Coalesce("discount_price", "price", output_field=DecimalField(max_digits=10, decimal_places=2)))
                .values("categories__id")
                .annotate(average=Avg("effective_price"))
            }
        for product in active_products:
            sold = current_by_product.get(product.id, 0)
            prior_sold = previous_by_product.get(product.id, 0)
            cover_days = round(product.stock * 30 / sold) if sold else None
            category = product.categories.first()
            category_average = category_averages.get(category.id) if category else None
            price = product.discount_price or product.price
            reasons = []
            if sold >= 3 and (prior_sold == 0 or sold >= prior_sold * 1.2):
                reasons.append("مبيعات آخر 30 يومًا قوية أو في نمو مقارنة بالفترة السابقة.")
            if sold and cover_days is not None and cover_days <= 21:
                reasons.append(f"المخزون الحالي يكفي نحو {cover_days} يومًا وفق معدل البيع الأخير.")
            if reasons:
                product_actions["increase_stock"].append({
                    "id": product.id, "name": product.name, "slug": product.slug,
                    "stock": product.stock, "units_sold": sold,
                    "suggested_stock": max(product.stock + 1, round(sold * 1.5)),
                    "reason": " ".join(reasons),
                })
                continue

            price_high = bool(category_average and category_average > 0 and price > category_average * Decimal("1.2"))
            if sold > 0 or (product.stock > 0 and not sold):
                if sold:
                    reason = f"باع {sold} وحدة في آخر 30 يومًا؛ راجع الصور والوصف والتقييمات لتحسين التحويل."
                    if prior_sold and sold < prior_sold:
                        reason += " المبيعات أقل من الثلاثين يومًا السابقة."
                else:
                    reason = "لم يسجل طلبات خلال آخر 30 يومًا؛ اختبر صورة أو وصفًا أو عرضًا مختلفًا قبل زيادة المخزون."
                if price_high:
                    reason += " السعر أعلى من متوسط الأسعار المعروضة في التصنيف بأكثر من 20%؛ وضّح القيمة أو اختبر سعرًا مناسبًا."
                product_actions["improve"].append({
                    "id": product.id, "name": product.name, "slug": product.slug,
                    "stock": product.stock, "units_sold": sold,
                    "reason": reason,
                })
            elif product.stock == 0 and prior_sold == 0:
                product_actions["pause_candidates"].append({
                    "id": product.id, "name": product.name, "slug": product.slug,
                    "stock": 0, "units_sold": sold,
                    "reason": "لا مخزون ولا طلبات مسجلة في الفترتين؛ راجع جدوى إعادة التوفير قبل إعادة النشر.",
                })

        for key in product_actions:
            product_actions[key] = product_actions[key][:6]
        action_plan = [
            {"window": "الأيام 1–7", "title": "تحسين المنتجات", "actions": [
                "حدّث صور ووصف أكثر المنتجات احتياجًا للتحسين، وراجع السعر مقابل متوسط الأسعار المعروضة في التصنيف.",
                "تأكد من توفر المنتجات ذات الطلب قبل تشغيل أي عرض.",
            ]},
            {"window": "الأيام 8–14", "title": "اختبار عرض واحد", "actions": [
                "اختبر خصمًا محدودًا أو حزمة على منتج واحد، وسجّل الوحدات والطلبات قبل الاختبار وبعده.",
                "أوقف الاختبار إذا قلّ هامش الربح؛ تكلفة المنتج غير متاحة حاليًا في التحليل.",
            ]},
            {"window": "الأيام 15–30", "title": "قرار المخزون والمحفظة", "actions": [
                "زد مخزون المنتجات التي استمر طلبها مع مراقبة معدل البيع والمخزون أسبوعيًا.",
                "اعتبر المنتجات الراكدة مرشحة للتجربة أو الإيقاف بعد مراجعة الزيارات والتكلفة، ولا تحذفها اعتمادًا على الطلبات وحدها.",
            ]},
        ]

        insights = []
        low_stock = list(products.filter(stock__lte=5).values("name", "stock")[:5])
        for item in low_stock:
            insights.append({
                "kind": "inventory",
                "title": f"Restock {item['name']}",
                "detail": f"Only {item['stock']} units remain. Check replenishment before the next order.",
                "priority": "high" if item["stock"] <= 2 else "medium",
            })

        if current_totals["revenue"] > previous_totals["revenue"] and previous_totals["revenue"] > 0:
            change = round((current_totals["revenue"] / previous_totals["revenue"] - 1) * 100)
            insights.append({"kind": "momentum", "title": "Sales are gaining momentum", "detail": f"Revenue is up {change}% compared with the previous 30 days.", "priority": "positive"})
        elif current_totals["revenue"] < previous_totals["revenue"] and previous_totals["revenue"] > 0:
            change = round((1 - current_totals["revenue"] / previous_totals["revenue"]) * 100)
            insights.append({"kind": "momentum", "title": "Review this month’s sales", "detail": f"Revenue is down {change}% from the previous 30 days. Try refreshing a listing or a small bundle offer.", "priority": "medium"})

        sold_recently = set(recent.values_list("product_id", flat=True).distinct())
        quiet_products = products.filter(is_approved=True, stock__gt=0).exclude(id__in=sold_recently)[:3]
        for product in quiet_products:
            insights.append({"kind": "listing", "title": f"Give {product.name} a boost", "detail": "No orders for this item in the last 30 days. Review the first photo, description, or price.", "priority": "low"})

        own_category_ids = set(products.values_list("categories__id", flat=True))
        category_units = lambda start, end: {
            row["product__categories__id"]: {
                "name": row["product__categories__name"],
                "units": int(row["units"] or 0),
            }
            for row in OrderItem.objects.filter(order__created_at__gte=start, order__created_at__lt=end)
            .exclude(order__status="cancelled")
            .values("product__categories__id", "product__categories__name")
            .annotate(units=Sum("quantity"))
        }
        current_category_units = category_units(since, now)
        previous_category_units = category_units(previous_since, since)
        rising_categories = []
        for category_id in own_category_ids:
            if not category_id:
                continue
            current = current_category_units.get(category_id, {"name": "", "units": 0})
            prior = previous_category_units.get(category_id, {"name": current["name"], "units": 0})
            if current["units"] >= 3 and (prior["units"] == 0 or current["units"] >= prior["units"] * 1.2):
                growth = "new activity" if prior["units"] == 0 else f"up {round((current['units'] / prior['units'] - 1) * 100)}%"
                rising_categories.append((current["units"], current["name"], growth))
        rising_categories.sort(reverse=True)
        if rising_categories:
            _, category_name, growth = rising_categories[0]
            insights.append({"kind": "market", "title": f"{category_name} demand is rising", "detail": f"Marketplace orders in this category are {growth} over the previous 30 days. Keep your strongest listing visible and in stock.", "priority": "positive"})

        for product in products.filter(is_approved=True, stock__gt=0).prefetch_related("categories")[:20]:
            category = product.categories.first()
            if not category:
                continue
            benchmark = (
                Product.objects.filter(is_approved=True, categories=category)
                .exclude(seller=user)
                .annotate(effective_price=Coalesce("discount_price", "price", output_field=DecimalField(max_digits=10, decimal_places=2)))
                .aggregate(average=Avg("effective_price"))["average"]
            )
            own_price = product.discount_price or product.price
            if benchmark and benchmark > 0 and own_price > benchmark * Decimal("1.2") and product.id not in sold_recently:
                difference = round((float(own_price / benchmark) - 1) * 100)
                insights.append({"kind": "pricing", "title": f"Review {product.name}’s value story", "detail": f"Its price is around {difference}% above the average listed price in {category.name}. Highlight what makes it special or review your offer.", "priority": "medium"})
                break

        return Response({
            "period_days": 30,
            "revenue": current_totals["revenue"],
            "revenue_basis": "Gross value of non-cancelled seller order lines; the current cash-on-delivery flow does not track collected payments.",
            "orders": current_totals["orders"],
            "units_sold": current_totals["units"],
            "previous_revenue": previous_totals["revenue"],
            "average_order_value": round(current_totals["revenue"] / current_totals["orders"], 2) if current_totals["orders"] else 0,
            "product_count": products.count(),
            "live_products": products.filter(is_approved=True).count(),
            "pending_products": products.filter(is_approved=False).count(),
            "low_stock_count": products.filter(stock__lte=5).count(),
            "pending_fulfillment": lines.filter(order__status__in=["pending", "processing"]).values("order_id").distinct().count(),
            "daily_sales": daily_sales,
            "top_products": top_products,
            "insights": insights[:6],
            "insights_method": "Transparent signals from your orders, inventory, and anonymized category totals.",
            "analyst": {
                "title": "محلل البيع والمنتجات",
                "summary": f"تم تحليل {products.count()} منتجًا بناءً على الطلبات والمخزون والأسعار المعروضة خلال آخر 30 يومًا.",
                "signals": ["طلبات غير ملغاة", "مقارنة آخر 30 يومًا بالفترة السابقة", "مخزون المنتجات", "متوسط الأسعار المعروضة في التصنيف"],
                "limitations": ["لا تتوفر بيانات الزيارات أو التحويلات أو المرتجعات أو تكلفة الشراء؛ لذلك لا نحسب الربح ولا نوصي بحذف تلقائي."],
            },
            "product_actions": product_actions,
            "action_plan": action_plan,
        })
