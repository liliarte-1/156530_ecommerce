import random
import string
import time
import requests
import re
import unicodedata
import sys

# code to create random products (to do not implement it by hand)

API_BASE_URL = "http://localhost:8000"

PRODUCT_NAMES = [
    "Laptop Pro",
    "Wireless Mouse",
    "Mechanical Keyboard",
    "Gaming Headset",
    "4K Monitor",
    "USB-C Hub",
    "Smartphone Stand",
    "External SSD",
    "Webcam HD",
    "Bluetooth Speaker",
]


CURRENCIES = ["USD"]


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text).strip("-")
    return text


def random_slug(title: str) -> str:
    suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=6))
    base = slugify(title)
    return f"{base}-{suffix}"


def generate_product() -> dict:
    title = random.choice(PRODUCT_NAMES)
    return {
        "title": title,
        "slug": random_slug(title),
        "description": f"High quality {title.lower()} for everyday use.",
        "price_cents": random.randint(1_000, 250_000),
        "currency": random.choice(CURRENCIES),
        "stock": random.randint(0, 100),
    }


def create_product(product: dict) -> None:
    try:
        response = requests.post(
            f"{API_BASE_URL}/products/",
            json=product,
            timeout=5,
        )
    except requests.RequestException as exc:
        print("Connection error:", exc)
        return

    if response.status_code == 201:
        data = response.json()
        print(f"Created product #{data['id']} → {data['title']} ({data['slug']})")
        return

    detail = None
    try:
        payload = response.json()
        detail = payload.get("detail")
    except Exception:
        pass

    if response.status_code == 409:
        print(f"Duplicate slug, skipping: {product['slug']}")
    else:
        print("Error:", response.status_code, detail or response.text)


def seed(count: int = 20, delay: float = 0.05) -> None:
    print(f" Seeding {count} products...")
    for i in range(count):
        product = generate_product()
        create_product(product)
        time.sleep(delay)  # avoid exploit server
    print("Done.")


if __name__ == "__main__":

    count = int(sys.argv[1]) if len(sys.argv) > 1 else 20
    delay = float(sys.argv[2]) if len(sys.argv) > 2 else 0.05
    seed(count, delay)
