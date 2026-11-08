# ABM-commerce — Django Backend Contract

This document is the source of truth for the Django REST API that the
ABM-commerce React frontend consumes. The frontend ships with a mock
service layer that mirrors this contract 1:1 — swapping to the live
Django server requires only setting `VITE_API_BASE_URL` and disabling
the mock adapter.

---

## 1. Base Configuration

```env
# .env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_USE_MOCK_API=true   # set to "false" to hit the real Django server
```

All requests are sent as `application/json` (except image uploads which
use `multipart/form-data`). All string fields are UTF-8 and support
Arabic (RTL) content natively.

---

## 2. Authentication

JWT (SimpleJWT) — two tokens stored in `localStorage`:

| Key                        | Purpose                          |
| -------------------------- | -------------------------------- |
| `abm.auth.access`          | Short-lived access token (15m)   |
| `abm.auth.refresh`         | Long-lived refresh token (7d)    |
| `abm.auth.user`            | Cached serialized user payload   |

### 401 Interceptor Flow

1. Any protected request that returns `401 Unauthorized` is intercepted.
2. Client POSTs `{ refresh }` to `/auth/token/refresh/`.
3. On success → replace `abm.auth.access`, retry the original request
   transparently.
4. On failure → clear all `abm.auth.*` keys, dispatch `auth:signout`,
   redirect to `/auth/login`.
5. Concurrent 401s are coalesced: only one refresh call fires; other
   requests await the same promise.

---

## 3. REST Endpoints

| Method | Path                          | Auth | Description                                     |
| ------ | ----------------------------- | ---- | ----------------------------------------------- |
| GET    | `/products/`                  | ❌   | Paginated products. Query: `search`, `category`, `tag`, `brand`, `ordering`, `page`. |
| GET    | `/products/:slug/`            | ❌   | Product detail incl. reviews & related.         |
| POST   | `/products/`                  | ✅   | Seller: create product.                         |
| PATCH  | `/products/:slug/`            | ✅   | Seller: update own product.                     |
| DELETE | `/products/:slug/`            | ✅   | Seller: delete own product.                     |
| GET    | `/categories/`                | ❌   | Full category tree.                             |
| POST   | `/auth/register/`             | ❌   | Create account (sends activation email, 24h).   |
| POST   | `/auth/token/`                | ❌   | Login → `{ access, refresh }`.                  |
| POST   | `/auth/token/refresh/`        | ❌   | Refresh access token.                           |
| GET    | `/auth/me/`                   | ✅   | Current user profile.                           |
| PATCH  | `/auth/me/`                   | ✅   | Update profile (email is immutable).            |
| POST   | `/auth/password-reset/`       | ❌   | Request password reset email.                   |
| GET    | `/cart/`                      | ⚠️   | Current cart (guest = local, user = server).    |
| POST   | `/cart/`                      | ⚠️   | Add / update line item `{ product_id, qty }`.   |
| DELETE | `/cart/:item_id/`             | ⚠️   | Remove line item.                               |
| GET    | `/orders/`                    | ✅   | User's order history.                           |
| POST   | `/orders/`                    | ✅   | Place order (checkout).                         |
| GET    | `/orders/:id/`                | ✅   | Order detail + status timeline.                 |

---

## 4. Serializer Schemas (Python → JSON)

### `ProductSerializer`

```python
class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            "id", "slug",
            "name", "name_ar",              # localizations (UTF-8)
            "description", "description_ar",
            "price", "discount_price",
            "stock", "sku",
            "category",                     # nested CategorySerializer
            "brand", "tags",                # tags = list[str]
            "images",                       # list[{ id, url, alt }]
            "rating_avg", "rating_count",
            "seller",                       # nested SellerMiniSerializer
            "is_featured", "is_approved",
            "created_at", "updated_at",
        ]
```

### `CategorySerializer`

```python
fields = ["id", "slug", "name", "name_ar", "icon", "parent", "children"]
```

### `UserSerializer`

```python
fields = [
    "id", "email",                          # email is read-only after signup
    "first_name", "last_name",
    "mobile_phone", "profile_picture",
    "address", "city", "country", "birthdate",
    "role",                                 # "customer" | "seller" | "admin"
    "is_active", "date_joined",
]
```

### `OrderSerializer`

```python
fields = [
    "id", "user", "items",                  # items = list[OrderItemSerializer]
    "shipping_address", "payment_method",
    "subtotal", "shipping", "tax", "total",
    "status",                               # pending|processing|shipped|delivered|cancelled
    "status_history",                       # list[{ status, changed_at }]
    "created_at",
]
```

### `ReviewSerializer`

```python
fields = ["id", "product", "user", "rating", "title", "body",
          "replies", "created_at"]
```

---

## 5. Error Envelope

```json
{ "detail": "Human readable message", "code": "invalid_credentials", "fields": { "email": ["..."] } }
```

The frontend `ApiError` class exposes `.detail`, `.code`, `.fields`, `.status`.

---

## 6. Seller onboarding and analytics

Customers apply from `/seller` after verifying their email. An application does not change the user's role. Only a staff administrator may review a pending application:

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| GET | `/auth/seller-application/` | Customer | Read the current user's application and decision. |
| POST | `/auth/seller-application/` | Verified customer | Submit or resubmit store details. |
| GET | `/auth/admin/seller-applications/?status=pending` | Staff | List applications for review. |
| PATCH | `/auth/admin/seller-applications/:id/review/` | Staff | Approve or request changes with a note. |
| GET | `/products/seller/dashboard/` | Approved seller | Read 30-day sales, stock, category and pricing signals. |

Approval promotes the applicant to `seller`. Product create, edit and delete endpoints also check for an approved seller application. Seller insights are transparent comparisons of order lines, inventory, category demand and marketplace listing prices; they do not call an external AI provider. Revenue is gross value of non-cancelled order lines because the current cash-on-delivery flow does not record collected payments.
