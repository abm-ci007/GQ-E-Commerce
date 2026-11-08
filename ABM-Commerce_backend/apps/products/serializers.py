from rest_framework import serializers
from .models import Product, Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "name_ar", "slug", "icon"]

class ProductSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)
    images = serializers.SerializerMethodField()
    seller = serializers.SerializerMethodField()
    category_ids = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), many=True, source="categories", write_only=True, required=False)
    class Meta:
        model = Product
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at", "seller"]
    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if user and user.is_authenticated and not user.is_staff:
            for name in ("is_approved", "is_featured"):
                fields[name].read_only = True
        return fields
    def get_seller(self, product):
        if not product.seller_id:
            return None
        return {"id": product.seller_id, "name": product.seller.get_full_name() or product.seller.username}
    def get_images(self, product):
        url = product.image_url
        request = self.context.get("request")
        if not url and product.image:
            url = request.build_absolute_uri(product.image.url) if request else product.image.url
        return [{"id": product.id, "url": url, "alt": product.name}] if url else []
