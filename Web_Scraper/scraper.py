import os
import json
import requests
import time
import logging
from bs4 import BeautifulSoup

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_URL = 'https://www.nanotek.lk/category/'

# List of product categories
categories = [
    'apple', 'television-tv', 'console-handheld-gaming', 'graphics-tablets', 'laptop',
    'laptop-monitor-accessories', 'processor', 'motherboards', 'memory-ram', 'graphics-card',
    'power-supply-ups-surge-protectors', 'cooling-lighting', 'storage-nas', 'casings', 'monitors',
    'speakers-headsets-ear-buds', 'keyboard-mouse-gamepad-controller', 'optical-drives-printers',
    'gaming-chairs', 'cables-connectors', 'external-storage', 'live-streaming-recording',
    'expansion-cards-networking', 'os-software', 'gaming-desktops', 'projectors', 'desktop-workstations'
]

# Define the output file path
output_dir = 'src/assets/json'
output_file = 'webscraper.json'
output_path = os.path.join(output_dir, output_file)

def fetch_category_page(category):
    url = f"{BASE_URL}{category}"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        return response.text
    except requests.RequestException as e:
        logger.error(f"Error fetching {category}: {e}")
        return None

def parse_product_details(url):
    """Fetch and parse detailed product information from individual product pages"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')
        details = {}

        # Extract product variations/specifications
        variations = soup.find('div', class_='ty-product-page-variations')
        if variations:
            for variation in variations.find_all('div', class_='ty-variation'):
                title = variation.find('span')
                value = variation.find('div', class_='ty-variation-options').find('span')
                if title and value:
                    details[title.text.strip()] = value.text.strip()

        # Extract product description
        description = soup.find('div', class_='ty-productPage-info')
        if description:
            details['description'] = description.get_text(strip=True)

        # Extract additional information
        add_info = soup.find('li', id='add-info')
        if add_info:
            details['additional_info'] = add_info.get_text(strip=True)

        return details
    except Exception as e:
        logger.error(f"Error parsing product details: {e}")
        return None

def parse_product_page(page_content):
    soup = BeautifulSoup(page_content, 'html.parser')
    products = []

    product_elements = soup.find_all('li', class_='ty-catPage-productListItem')

    for product in product_elements:
        try:
            # Find product title
            title_elem = product.find('h1')
            name = title_elem.get_text(strip=True) if title_elem else None

            # Find product price
            price_elem = product.find('h2', class_='ty-productBlock-price-retail')
            price = price_elem.get_text(strip=True) if price_elem else None

            # Find product link
            link_elem = product.find('a')
            link_url = link_elem['href'] if link_elem and link_elem.has_attr('href') else None

            # Find product image URL
            img_elem = product.find('img')
            image_url = img_elem['src'] if img_elem and img_elem.has_attr('src') else None

            # Find product category
            category_elem = product.find('span', class_='ty-productBlock-cat')
            category = category_elem.get_text(strip=True) if category_elem else None

            if name and price and link_url:
                product_data = {
                    'name': name,
                    'price': price,
                    'link': link_url,
                    'image': image_url,
                    'category': category
                }

                # Fetch additional product details
                details = parse_product_details(link_url)
                if details:
                    product_data.update(details)

                products.append(product_data)
                logger.info(f"Found product: {name}")
        except Exception as e:
            logger.error(f"Error parsing product: {e}")
            continue

    return products

def main():
    all_products = []
    for category in categories:
        logger.info(f"Scraping category: {category}")
        page_content = fetch_category_page(category)
        if page_content:
            products = parse_product_page(page_content)
            all_products.extend(products)
            # Add delay between requests
            time.sleep(1)

    logger.info(f"Total products found: {len(all_products)}")

    # Ensure the output directory exists
    os.makedirs(output_dir, exist_ok=True)

    # Write data to the JSON file
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(all_products, f, ensure_ascii=False, indent=4)

    logger.info(f"Data has been written to {output_path}")

if __name__ == '__main__':
    main()
