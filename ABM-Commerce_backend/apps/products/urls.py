from django.urls import path
from .views import (
    ProductListView,
    ProductDetailView,
    CategoryListAPIView,
    SellerDashboardAPIView,
)


urlpatterns = [
    path('', ProductListView.as_view(), name='product-list'),  
    path('categories/', CategoryListAPIView.as_view(), name='category-list'),  # List view for all categories
    path('seller/dashboard/', SellerDashboardAPIView.as_view(), name='seller-dashboard'),
    path('<slug:slug>/', ProductDetailView.as_view(), name='product-detail'),  # Detail view for a specific product
]
