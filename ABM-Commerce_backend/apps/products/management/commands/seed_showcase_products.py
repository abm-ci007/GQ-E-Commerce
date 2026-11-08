from decimal import Decimal

from django.core.management.base import BaseCommand
from apps.products.models import Category, Product


SHOWCASE_PRODUCTS = [
    {
        "sku": "ABM-EDIT-001", "slug": "solstice-ceramic-pour-over-set", "name": "Solstice Ceramic Pour-Over Set",
        "name_ar": "طقم سولستيس للسيراميك والقهوة المقطرة", "category": "gourmet", "brand": "Daybreak Studio",
        "price": "1480", "discount_price": "1290", "stock": 18,
        "description": "A glazed stoneware dripper and matching server made for slow mornings. Includes a reusable stainless filter and a 600 ml glass carafe.",
        "description_ar": "قطعة سيراميك مزججة مع إبريق زجاجي لتحضير قهوة هادئة كل صباح. يتضمن الطقم مصفاة ستانلس قابلة لإعادة الاستخدام وإبريقًا بسعة 600 مل.",
        "image_url": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85",
        "tags": ["coffee", "ceramic", "slow mornings", "gift"],
    },
    {
        "sku": "ABM-EDIT-002", "slug": "orbit-portable-bluetooth-speaker", "name": "Orbit Portable Bluetooth Speaker",
        "name_ar": "مكبر الصوت المحمول أوربت", "category": "technology", "brand": "Form Audio",
        "price": "2750", "discount_price": None, "stock": 24,
        "description": "A compact 20 W wireless speaker with warm, room-filling sound, USB-C charging, 12-hour play time and a splash-resistant woven shell.",
        "description_ar": "مكبر صوت لاسلكي بقدرة 20 واط وصوت واضح يملأ الغرفة، مع شحن USB-C ووقت تشغيل يصل إلى 12 ساعة وهيكل نسيجي مقاوم لرذاذ الماء.",
        "image_url": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=85",
        "tags": ["audio", "bluetooth", "portable", "usb-c"],
    },
    {
        "sku": "ABM-EDIT-003", "slug": "terra-hand-thrown-bud-vase", "name": "Terra Hand-Thrown Bud Vase",
        "name_ar": "مزهرية تيرا الخزفية المصنوعة يدويًا", "category": "home-living", "brand": "Clay & Form",
        "price": "890", "discount_price": None, "stock": 31,
        "description": "A small, tactile stoneware vase with a sand-colored matte glaze. Each piece has a subtly different silhouette; approximately 16 cm tall.",
        "description_ar": "مزهرية صغيرة من الخزف الحجري بملمس طبيعي وطلاء رملي مطفأ. لكل قطعة شكلها الخاص، ويبلغ ارتفاعها نحو 16 سم.",
        "image_url": "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=900&q=85",
        "tags": ["handmade", "stoneware", "decor", "gift"],
    },
    {
        "sku": "ABM-EDIT-004", "slug": "cloud-nine-linen-overshirt", "name": "Cloud Nine Linen Overshirt",
        "name_ar": "قميص كلاود ناين الكتاني", "category": "fashion", "brand": "Soft Form",
        "price": "2190", "discount_price": "1890", "stock": 16,
        "description": "An easy, breathable 100% linen layer with a relaxed fit, corozo buttons and a curved hem. Designed to wear open or buttoned through the warmer months.",
        "description_ar": "قميص بطبقة خفيفة وقصة مريحة من الكتان الطبيعي 100٪، بأزرار نباتية وحافة منحنية. يُرتدى مفتوحًا أو مغلقًا في الأيام الدافئة.",
        "image_url": "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=900&q=85",
        "tags": ["linen", "everyday", "lightweight", "unisex"],
    },
    {
        "sku": "ABM-EDIT-005", "slug": "aura-calm-barrier-serum", "name": "Aura Calm Barrier Serum",
        "name_ar": "سيروم أورا كالم لترطيب البشرة", "category": "beauty", "brand": "Kindred Skin",
        "price": "760", "discount_price": None, "stock": 42,
        "description": "A fragrance-free daily serum with ceramides, panthenol and hyaluronic acid. Lightweight hydration for sensitive or dehydrated skin; 30 ml glass bottle.",
        "description_ar": "سيروم يومي خالٍ من العطور بالسيراميد والبانثينول وحمض الهيالورونيك. ترطيب خفيف للبشرة الحساسة أو الجافة، في زجاجة 30 مل.",
        "image_url": "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=85",
        "tags": ["skincare", "fragrance-free", "ceramides", "30ml"],
    },
    {
        "sku": "ABM-EDIT-006", "slug": "studio-arc-adjustable-desk-lamp", "name": "Studio Arc Adjustable Desk Lamp",
        "name_ar": "مصباح ستوديو آرك المكتبي القابل للتعديل", "category": "home-living", "brand": "Northline Objects",
        "price": "1850", "discount_price": None, "stock": 13,
        "description": "A powder-coated steel task lamp with two adjustable joints, a weighted base and a warm LED bulb included. 220 V, E27 socket.",
        "description_ar": "مصباح عمل من الفولاذ المطلي بطبقة بودرة مع مفصلين قابلين للتعديل وقاعدة ثابتة ولمبة LED دافئة. يعمل بجهد 220 فولت وقاعدة E27.",
        "image_url": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85",
        "tags": ["lighting", "desk", "steel", "led"],
    },
    {
        "sku": "ABM-EDIT-007", "slug": "weekender-recycled-canvas-tote", "name": "Weekender Recycled Canvas Tote",
        "name_ar": "حقيبة ويك إندر من القماش المعاد تدويره", "category": "fashion", "brand": "Common Thread",
        "price": "1120", "discount_price": None, "stock": 37,
        "description": "A sturdy everyday carryall made from recycled cotton canvas, with a zipped inner pocket, reinforced handles and room for a 14-inch laptop.",
        "description_ar": "حقيبة يومية متينة من قطن معاد تدويره، بجيب داخلي بسحاب ومقابض مدعمة ومساحة تناسب حاسوبًا محمولًا حتى 14 بوصة.",
        "image_url": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=85",
        "tags": ["recycled", "canvas", "everyday bag", "laptop"],
    },
    {
        "sku": "ABM-EDIT-008", "slug": "pulse-noise-reducing-earbuds", "name": "Pulse Noise-Reducing Earbuds",
        "name_ar": "سماعات بالس نبض لاسلكية", "category": "technology", "brand": "Form Audio",
        "price": "3290", "discount_price": "2990", "stock": 21,
        "description": "True wireless earbuds with adaptive noise reduction, transparency mode, touch controls and up to 28 hours with the pocket charging case. USB-C cable included.",
        "description_ar": "سماعات لاسلكية بعزل ضوضاء متكيف ووضع شفافية وتحكم باللمس، ووقت تشغيل يصل إلى 28 ساعة مع علبة الشحن الصغيرة. تتضمن كابل USB-C.",
        "image_url": "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=85",
        "tags": ["wireless", "audio", "noise reduction", "usb-c"],
    },
    {
        "sku": "ABM-EDIT-009", "slug": "stillwater-cotton-waffle-throw", "name": "Stillwater Cotton Waffle Throw",
        "name_ar": "بطانية ستيلووتر القطنية المنسوجة", "category": "home-living", "brand": "Sunday House",
        "price": "1690", "discount_price": None, "stock": 19,
        "description": "A breathable 100% cotton waffle blanket with a soft washed finish. Generously sized at 130 × 170 cm for the sofa, a cool evening or a relaxed picnic.",
        "description_ar": "بطانية قطنية 100٪ بنسيج وافل خفيف وملمس مغسول ناعم. مقاس واسع 130 × 170 سم للأريكة أو للأمسيات الهادئة أو للنزهات.",
        "image_url": "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85",
        "tags": ["cotton", "throw", "home", "picnic"],
    },
    {
        "sku": "ABM-EDIT-010", "slug": "daily-reset-yoga-mat", "name": "Daily Reset Yoga Mat",
        "name_ar": "بساط دَيلي ريسِت لليوغا", "category": "wellness", "brand": "Open Practice",
        "price": "1380", "discount_price": None, "stock": 27,
        "description": "A 5 mm natural-rubber and cork mat with a grippy surface, alignment marks and a cotton carry strap. Wipe clean after practice.",
        "description_ar": "بساط بسماكة 5 مم من المطاط الطبيعي والفلين، بسطح ثابت وعلامات للمحاذاة وحزام حمل قطني. يُنظف بسهولة بعد التمرين.",
        "image_url": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=85",
        "tags": ["yoga", "cork", "natural rubber", "fitness"],
    },
    {
        "sku": "ABM-EDIT-011", "slug": "little-sun-citrus-candle-set", "name": "Little Sun Citrus Candle Set",
        "name_ar": "طقم شموع ليتل صن برائحة الحمضيات", "category": "home-living", "brand": "Kindled Home",
        "price": "980", "discount_price": "850", "stock": 34,
        "description": "Two small-batch soy wax candles scented with bergamot, orange peel and cedar. Each 120 g candle burns for approximately 25 hours.",
        "description_ar": "شمعتان من شمع الصويا المصنوع على دفعات صغيرة، برائحة البرغموت وقشر البرتقال وخشب الأرز. وزن كل شمعة 120 جرامًا ومدة احتراقها نحو 25 ساعة.",
        "image_url": "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=85",
        "tags": ["soy wax", "citrus", "home fragrance", "gift set"],
    },
    {
        "sku": "ABM-EDIT-012", "slug": "cove-insulated-steel-bottle", "name": "Cove Insulated Steel Bottle",
        "name_ar": "زجاجة كوف المعزولة من الستانلس ستيل", "category": "wellness", "brand": "Good Current",
        "price": "790", "discount_price": None, "stock": 53,
        "description": "A double-wall 18/8 stainless bottle that keeps drinks cold for up to 24 hours or hot for 12. Leakproof screw lid, 600 ml capacity, BPA-free.",
        "description_ar": "زجاجة مزدوجة الجدار من الستانلس ستيل 18/8 تحفظ المشروبات باردة حتى 24 ساعة أو ساخنة حتى 12 ساعة. سعة 600 مل وغطاء محكم وخالية من BPA.",
        "image_url": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=85",
        "tags": ["reusable", "insulated", "steel", "600ml"],
    },
    {
        "sku": "ABM-EDIT-013", "slug": "soft-focus-tinted-lip-balm", "name": "Soft Focus Tinted Lip Balm",
        "name_ar": "مرطب شفاه سوفت فوكس بلون طبيعي", "category": "beauty", "brand": "Kindred Skin",
        "price": "390", "discount_price": None, "stock": 61,
        "description": "A sheer, buildable tint with jojoba oil and shea butter for comfortable daily moisture. Fragrance-free, 4 g twist-up tube.",
        "description_ar": "لون خفيف قابل للتدرج مع زيت الجوجوبا وزبدة الشيا لترطيب يومي مريح. خالٍ من العطور في عبوة دوارة 4 جرامات.",
        "image_url": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=900&q=85",
        "tags": ["lip care", "tinted", "jojoba", "fragrance-free"],
    },
    {
        "sku": "ABM-EDIT-014", "slug": "marina-low-top-everyday-sneaker", "name": "Marina Low-Top Everyday Sneaker",
        "name_ar": "حذاء مارينا الرياضي للاستخدام اليومي", "category": "fashion", "brand": "Good Steps",
        "price": "2390", "discount_price": None, "stock": 20,
        "description": "A clean low-top canvas sneaker with a cushioned footbed, flexible rubber sole and cotton laces. Easy to style, built for long city days.",
        "description_ar": "حذاء قماشي بسيط بكعب منخفض ونعل داخلي مبطن ونعل مطاطي مرن ورباط قطني. تصميم عملي ومريح لأيام المدينة الطويلة.",
        "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85",
        "tags": ["sneakers", "canvas", "everyday", "unisex"],
    },
    {
        "sku": "ABM-EDIT-015", "slug": "golden-hour-date-and-nut-box", "name": "Golden Hour Date & Nut Box",
        "name_ar": "علبة جولدن آور للتمور والمكسرات", "category": "gourmet", "brand": "Palm & Pantry",
        "price": "620", "discount_price": None, "stock": 29,
        "description": "A 450 g sharing box of soft Medjool dates, roasted almonds and orange-blossom tahini dip. Packed for gifting or an afternoon table.",
        "description_ar": "علبة مشاركة بوزن 450 جرامًا تضم تمر مجدول طريًا ولوزًا محمصًا وصلصة طحينة بماء زهر البرتقال. مناسبة للضيافة أو كهدية.",
        "image_url": "https://images.unsplash.com/photo-1603046891744-76e6300a9f54?auto=format&fit=crop&w=900&q=85",
        "tags": ["dates", "almonds", "gift", "pantry"],
    },
    {
        "sku": "ABM-EDIT-016", "slug": "field-notes-pocket-journal-trio", "name": "Field Notes Pocket Journal Trio",
        "name_ar": "مجموعة دفاتر فيلد نوتس الصغيرة", "category": "home-living", "brand": "Paper Habit",
        "price": "480", "discount_price": None, "stock": 46,
        "description": "Three pocket notebooks with soft-touch recycled covers, 64 uncoated dotted pages each, lay-flat binding and a handy back pocket.",
        "description_ar": "ثلاثة دفاتر صغيرة بأغلفة معاد تدويرها وملمس ناعم، في كل منها 64 صفحة منقطة غير لامعة وتجليد يفتح بسهولة وجيب خلفي.",
        "image_url": "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=900&q=85",
        "tags": ["stationery", "recycled paper", "journaling", "set of 3"],
    },
    {
        "sku": "ABM-EDIT-017", "slug": "mellow-matcha-whisk-kit", "name": "Mellow Matcha Whisk Kit",
        "name_ar": "طقم ميلو لتحضير الماتشا", "category": "gourmet", "brand": "Daybreak Studio",
        "price": "1150", "discount_price": "990", "stock": 14,
        "description": "A beginner-friendly tea set with a bamboo whisk, ceramic bowl, scoop and a 30 g tin of bright, smooth ceremonial-style matcha.",
        "description_ar": "طقم بسيط لتحضير الشاي يضم مضرب خيزران ووعاء سيراميك وملعقة وعلبة ماتشا 30 جرامًا بطعم ناعم ولون أخضر زاهٍ.",
        "image_url": "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=900&q=85",
        "tags": ["matcha", "tea", "bamboo whisk", "starter set"],
    },
    {
        "sku": "ABM-EDIT-018", "slug": "nomad-65w-usb-c-charger", "name": "Nomad 65W USB-C Travel Charger",
        "name_ar": "شاحن نوماد للسفر بقدرة 65 واط", "category": "technology", "brand": "Good Current",
        "price": "1590", "discount_price": None, "stock": 26,
        "description": "A compact dual-port GaN charger with one 65 W USB-C PD port and one USB-A port. Foldable plug, over-temperature protection and international voltage support.",
        "description_ar": "شاحن GaN صغير بمنفذين: USB-C PD بقدرة 65 واط وUSB-A. قابس قابل للطي مع حماية من الحرارة ودعم لجهود الكهرباء المختلفة.",
        "image_url": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=900&q=85",
        "tags": ["charger", "65w", "usb-c", "travel", "gan"],
    },
]


class Command(BaseCommand):
    help = "Add a curated, realistic ABM showcase assortment without duplicating existing items."

    def handle(self, *args, **options):
        created = 0
        for item in SHOWCASE_PRODUCTS:
            category = Category.objects.get(slug=item["category"])
            values = {key: value for key, value in item.items() if key != "category"}
            values["price"] = Decimal(values["price"])
            if values["discount_price"] is not None:
                values["discount_price"] = Decimal(values["discount_price"])
            values.update(is_approved=True, is_featured=True)
            product, was_created = Product.objects.get_or_create(sku=item["sku"], defaults=values)
            product.categories.add(category)
            created += int(was_created)
        self.stdout.write(self.style.SUCCESS(f"Showcase assortment ready: {len(SHOWCASE_PRODUCTS)} products ({created} new)."))
