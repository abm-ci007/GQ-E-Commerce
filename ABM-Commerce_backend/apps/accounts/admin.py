from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from .models import SellerApplication, User

@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = ("username", "email", "role", "is_staff", "is_active", "email_verified")
    list_filter = ("role", "is_staff", "is_active", "email_verified")
    fieldsets = DjangoUserAdmin.fieldsets + (("Marketplace", {"fields": ("role", "mobile_phone", "email_verified")}),)


@admin.register(SellerApplication)
class SellerApplicationAdmin(admin.ModelAdmin):
    list_display = ("store_name", "user", "business_type", "city", "status", "submitted_at")
    list_filter = ("status", "business_type", "city")
    search_fields = ("store_name", "user__email", "user__first_name", "user__last_name")
    readonly_fields = ("submitted_at", "reviewed_at", "reviewed_by")
