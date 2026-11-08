from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=255)
    name_ar = models.CharField(max_length=255, blank=True)
    slug = models.SlugField(unique=True)
    icon = models.CharField(max_length=64, blank=True)

    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=255)
    name_ar = models.CharField(max_length=255, blank=True)
    description = models.TextField()
    description_ar = models.TextField(blank=True)
    brand = models.CharField(max_length=120, blank=True, db_index=True)
    tags = models.JSONField(default=list, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)])
    stock = models.PositiveIntegerField(default=0)
    sku = models.CharField(max_length=100, unique=True)
    image = models.ImageField(upload_to="products/", null=True, blank=True)
    image_url = models.URLField(blank=True)
    slug = models.SlugField(unique=True)
    is_featured = models.BooleanField(default=False, db_index=True)
    is_approved = models.BooleanField(default=False, db_index=True)
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="products")
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    categories = models.ManyToManyField(Category, related_name="products", blank=True)

    def __str__(self):
        return self.name
