from django.urls import path
from .views import OrderDetailAPIView, OrderItemListAPIView, OrderListCreateAPIView

urlpatterns = [
    path("", OrderListCreateAPIView.as_view(), name="order-list-create"),
    path("items/", OrderItemListAPIView.as_view(), name="order-items"),
    path("<int:pk>/", OrderDetailAPIView.as_view(), name="order-detail"),
]
