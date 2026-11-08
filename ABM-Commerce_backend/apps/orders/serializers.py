from decimal import Decimal
from django.db import transaction
from rest_framework import serializers
from apps.products.models import Product
from apps.products.serializers import ProductSerializer
from .models import Order, OrderItem

class OrderLineInputSerializer(serializers.Serializer):
    product = serializers.JSONField()
    qty = serializers.IntegerField(min_value=1, max_value=50)
    def validate_product(self, value):
        if isinstance(value, dict):
            value = value.get("id")
        try:
            return int(value)
        except (TypeError, ValueError):
            raise serializers.ValidationError("Invalid product.")

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    qty = serializers.IntegerField(source="quantity", read_only=True)
    class Meta:
        model = OrderItem
        fields = ["product", "qty", "price"]

class OrderSerializer(serializers.ModelSerializer):
    items = OrderLineInputSerializer(many=True, write_only=True, min_length=1, max_length=50)
    class Meta:
        model = Order
        fields = ["id", "user", "status", "created_at", "items", "shipping_address", "payment_method", "subtotal", "shipping", "tax", "total"]
        read_only_fields = ["id", "user", "status", "created_at", "subtotal", "shipping", "tax", "total"]
    def validate_shipping_address(self, value):
        required = ("full_name", "line1", "city", "country", "phone")
        if not isinstance(value, dict) or any(not str(value.get(field, "")).strip() for field in required):
            raise serializers.ValidationError("Enter a complete delivery address.")
        return {key: str(value[key]).strip()[:255] for key in required}
    def validate_payment_method(self, value):
        if value != "cod":
            raise serializers.ValidationError("The selected payment method is not available.")
        return value
    @transaction.atomic
    def create(self, validated_data):
        lines = validated_data.pop("items")
        user = self.context["request"].user
        order = Order.objects.create(user=user, **validated_data)
        subtotal = Decimal("0.00")
        for line in lines:
            product_id, quantity = line["product"], line["qty"]
            try:
                product = Product.objects.select_for_update().get(pk=product_id, is_approved=True)
            except Product.DoesNotExist:
                raise serializers.ValidationError({"items": "A selected product is unavailable."})
            if product.stock < quantity:
                raise serializers.ValidationError({"items": f"Not enough stock for {product.name}."})
            price = product.discount_price or product.price
            product.stock -= quantity
            product.save(update_fields=["stock", "updated_at"])
            OrderItem.objects.create(order=order, product=product, quantity=quantity, price=price)
            subtotal += price * quantity
        shipping = Decimal("0.00") if subtotal >= Decimal("500.00") else Decimal("25.00")
        tax = (subtotal * Decimal("0.05")).quantize(Decimal("0.01"))
        order.subtotal, order.shipping, order.tax, order.total = subtotal, shipping, tax, subtotal + shipping + tax
        order.save(update_fields=["subtotal", "shipping", "tax", "total"])
        return order
    def to_representation(self, instance):
        result = super().to_representation(instance)
        result["items"] = OrderItemSerializer(instance.items.select_related("product").all(), many=True, context=self.context).data
        return result
