import json
import re
import os

def get_json_path(filename):
    """Get the correct path for JSON files"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(current_dir, "..", "src", "assets", "json", filename)

def clean_price(price_str):
    """Clean price string and convert to integer"""
    if not price_str:
        return 0
    return int(re.sub(r'[^\d]', '', price_str))

def extract_specifications(description):
    """Extract specifications from description text"""
    specs = []
    lines = description.split('\n')
    for line in lines:
        if ':' in line:
            name, value = line.split(':', 1)
            specs.append({
                "name": name.strip(),
                "value": value.strip()
            })
    return specs

def format_product(scraped_item):
    """Format scraped item according to the product model"""

    product = {
        "id": re.sub(r'[^\w-]', '-', scraped_item['name'].lower()),
        "title": scraped_item['name'],
        "price": clean_price(scraped_item.get('price', '0')),
        "image": scraped_item.get('image', ''),
        "images": [scraped_item.get('image', '')],
        "category": scraped_item.get('category', '').lower().split()[0],
        "_comment": scraped_item.get('category', ''),
        "colors": [],
        "sizes": [],
        "rating": 4.5,  # Default rating
        "reviewCount": 0,
        "orderCount": 0,
        "description": scraped_item.get('description', '').strip(),
        "specifications": extract_specifications(scraped_item.get('description', '')),
        "faqs": [],
        "files": []
    }

    # Extract additional info if available
    if 'additional_info' in scraped_item:
        product['specifications'].extend(
            extract_specifications(scraped_item['additional_info'])
        )

    return product

def merge_products(existing_products, new_products):
    """Merge new products with existing ones, preserving existing content"""
    existing_ids = {p.get('id') for p in existing_products if p.get('id')}

    # Only add products that don't already exist
    products_to_add = [p for p in new_products if p['id'] not in existing_ids]

    # Find the last non-empty product in existing list
    last_valid_index = -1
    for i, product in enumerate(existing_products):
        if product and any(product.values()):
            last_valid_index = i

    # Insert new products after the last valid product
    insert_position = last_valid_index + 1
    for product in products_to_add:
        if insert_position < len(existing_products):
            existing_products[insert_position] = product
        else:
            existing_products.append(product)
        insert_position += 1

    return existing_products

def main():
    # Get file paths
    current_dir = os.path.dirname(os.path.abspath(__file__))
    products_path = os.path.join(current_dir, "..", "src", "assets", "json", "products.json")
    webscraper_path = os.path.join(current_dir, "..", "src", "assets", "json", "webscraper.json")

    # Read existing products
    try:
        with open(products_path, 'r', encoding='utf-8') as f:
            existing_products = json.load(f)
    except FileNotFoundError:
        existing_products = []

    # Read webscraper data
    with open(webscraper_path, 'r', encoding='utf-8') as f:
        scraped_data = json.load(f)

    # Format scraped products
    new_products = [format_product(item) for item in scraped_data]

    # Merge while preserving existing content
    merged_products = merge_products(existing_products, new_products)

    # Write back to products.json
    with open(products_path, 'w', encoding='utf-8') as f:
        json.dump(merged_products, f, indent=2, ensure_ascii=False)

    print(f"Successfully merged new products while preserving existing content")

if __name__ == "__main__":
    main()
