from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from apps.products.models import Product, Category

class Command(BaseCommand):
    help = "Create 100 deterministic sample products for local testing."
    def handle(self, *args, **options):
        names = ["Linen Shirt", "Ceramic Vase", "Daily Serum", "Wireless Speaker", "Yoga Mat", "Coffee Set", "Leather Tote", "Desk Lamp", "Botanical Oil", "Travel Mug"]
        cats = ["Fashion", "Home & Living", "Beauty", "Technology", "Wellness", "Gourmet"]
        categories = [Category.objects.get_or_create(slug=slugify(n), defaults={"name": n})[0] for n in cats]
        brands = ["Samsung", "Xiaomi", "Apple", "Anker", "Nivea", "Adidas", "IKEA", "Philips", "Sony", "Braun"]
        photos = ["photo-1523275335684-37898b6baf30", "photo-1503602642458-232111445657", "photo-1556228578-0d85b1a4d571", "photo-1505740420928-5e560c06d30e", "photo-1542291026-7eec264c27ff", "photo-1543163521-1bf539c55dd2", "photo-1526170375885-4d8ecf77b99f", "photo-1523275335684-37898b6baf30"]
        created = 0
        for i in range(100):
            title = f"{names[i % len(names)]} {i + 1:03d}"
            slug = slugify(title)
            sku = f"ABM-DEMO-{i + 1:03d}"
            arabic = "".join(chr(n) for n in (0x0645, 0x0646, 0x062a, 0x062c, 0x0020, 0x062a, 0x062c, 0x0631, 0x064a, 0x0628, 0x064a, 0x0020, 0x0631, 0x0642, 0x0645, 0x0020)) + str(i + 1) + " " + "".join(chr(n) for n in (0x0644, 0x0644, 0x0627, 0x062e, 0x062a, 0x0628, 0x0627, 0x0631, 0x002e))
            product, was_created = Product.objects.get_or_create(sku=sku, defaults={"name": title, "name_ar": title, "description": f"Sample product {i + 1} for storefront, search, cart and checkout testing.", "description_ar": arabic, "price": Decimal(100 + (i * 37) % 4900), "discount_price": Decimal(80 + (i * 29) % 3600) if i % 4 == 0 else None, "stock": 1 + (i * 7) % 80, "brand": brands[i % len(brands)], "tags": [cats[i % len(cats)].lower(), "best seller" if i % 3 == 0 else "new"], "image_url": f"https://images.unsplash.com/{photos[i % len(photos)]}?auto=format&fit=crop&w=900&q=80", "is_featured": i < 12, "is_approved": True, "slug": slug})
            product.brand = product.brand or brands[i % len(brands)]
            product.tags = product.tags or [cats[i % len(cats)].lower(), "best seller" if i % 3 == 0 else "new"]
            product.image_url = product.image_url or f"https://images.unsplash.com/{photos[i % len(photos)]}?auto=format&fit=crop&w=900&q=80"
            product.is_approved = True
            product.is_featured = i < 12
            if product.discount_price and product.discount_price >= product.price:
                product.discount_price = (product.price * Decimal("0.8")).quantize(Decimal("0.01"))
            product.save()
            product.categories.add(categories[i % len(categories)])
            created += int(was_created)
        self.stdout.write(self.style.SUCCESS(f"Ready: 100 demo products (created {created}; existing demo items preserved)."))
