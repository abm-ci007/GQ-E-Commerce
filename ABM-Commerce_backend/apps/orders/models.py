from django.conf import settings
from django.db import models
from apps.products.models import Product

class Order(models.Model):
    STATUS_CHOICES = [("pending", "Pending"), ("processing", "Processing"), ("paid", "Paid"), ("shipped", "Shipped"), ("delivered", "Delivered"), ("cancelled", "Cancelled")]
    PAYMENT_CHOICES = [("cod", "Cash on delivery")]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="orders")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending", db_index=True)
    shipping_address = models.JSONField(default=dict)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default="cod")
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    def __str__(self):
        return f"Order #{self.pk}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.product.name
