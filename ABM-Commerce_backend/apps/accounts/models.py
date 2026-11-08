from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [("customer", "Customer"), ("seller", "Seller")]
    role = models.CharField(max_length=16, choices=ROLE_CHOICES, default="customer")
    mobile_phone = models.CharField(max_length=32, blank=True)
    email_verified = models.BooleanField(default=False)
    verification_code_hash = models.CharField(max_length=128, blank=True)
    verification_expires_at = models.DateTimeField(null=True, blank=True)
    password_reset_code_hash = models.CharField(max_length=128, blank=True)
    password_reset_expires_at = models.DateTimeField(null=True, blank=True)


class SellerApplication(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending review"),
        ("approved", "Approved"),
        ("rejected", "Needs changes"),
    ]

    BUSINESS_TYPES = [
        ("individual", "Independent maker / individual"),
        ("registered", "Registered business"),
        ("brand", "Established brand"),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="seller_application")
    store_name = models.CharField(max_length=120)
    business_type = models.CharField(max_length=20, choices=BUSINESS_TYPES)
    contact_phone = models.CharField(max_length=32)
    city = models.CharField(max_length=100)
    website = models.URLField(blank=True)
    description = models.TextField(max_length=1200)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="pending", db_index=True)
    review_note = models.CharField(max_length=1000, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="reviewed_seller_applications")

    class Meta:
        ordering = ["status", "submitted_at"]

    def __str__(self):
        return f"{self.store_name} — {self.get_status_display()}"
