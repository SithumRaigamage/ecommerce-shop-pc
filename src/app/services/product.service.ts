import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { ProductModel } from '../models/ProductModel';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  getProductById(productId: string) {
    throw new Error('Method not implemented.');
  }

  private products: ProductModel[] = [
    {
      id: '1',
      title: 'High-Performance Gaming Laptop',
      price: 1499.99,
      image: 'https://cdn.easyfrontend.com/pictures/courses/courses_3_2.png',
      images: [
        'https://cdn.easyfrontend.com/pictures/courses/courses_3_2.png',
        'https://cdn.easyfrontend.com/pictures/courses/courses_3_2.png',
        'https://cdn.easyfrontend.com/pictures/courses/courses_3_2.png',
      ],
      category: 'laptops',
      colors: ['Black', 'Silver', 'Gray'],
      sizes: [
        { name: 'Small', description: 'Small size for comfort' },
        { name: 'Medium', description: 'Medium size for everyday use' },
        { name: 'Large', description: 'Large size for extended use' },
      ],
      rating: 4.5,
      reviewCount: 100,
      orderCount: 200,
      description: 'High-performance gaming laptop with an AMD Ryzen 9 processor, 16GB RAM, and 512GB SSD storage',
    },
    {
      id: '2',
      title: 'MacBook Pro 16-inch',
      price: 2499.99,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
        'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9',
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef',
      ],
      category: 'laptops',
      description: 'Apple M2 Pro chip, 16GB RAM, 512GB SSD, 16-inch Liquid Retina XDR display',
      colors: ['Black', 'Silver','Gold'],
      sizes: [
        { name: '512GB', description: 'Base model with 512GB storage' },
        { name: '1TB', description: 'Extended storage with 1TB' },
        { name: '2TB', description: 'Maximum storage with 2TB' },
      ],
      rating: 4.8,
      reviewCount: 250,
      orderCount: 450,
    },
    {
      id: '3',
      title: 'Dell XPS 15',
      price: 1899.99,
      image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45',
      images: [
        'https://images.unsplash.com/photo-1593642632823-8f785ba67e45',
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed',
        'https://images.unsplash.com/photo-1629429408209-1f912961dbd8',
      ],
      category: 'laptops',
      description: '12th Gen Intel i7, 32GB RAM, 1TB SSD, NVIDIA RTX 3050 Ti, 15.6" 4K OLED display',
      colors: ['Silver', 'Blue', 'Black'],
      sizes: [
        { name: 'i5/16GB', description: 'Core i5 with 16GB RAM' },
        { name: 'i7/32GB', description: 'Core i7 with 32GB RAM' },
        { name: 'i9/64GB', description: 'Core i9 with 64GB RAM' },
      ],
      rating: 4.6,
      reviewCount: 180,
      orderCount: 320,
    },
    {
      id: '4',
      title: 'Lenovo ThinkPad X1 Carbon',
      price: 1599.99,
      image: 'https://cdn.easyfrontend.com/pictures/laptops/thinkpad-x1.png',
      images: [
        'https://cdn.easyfrontend.com/pictures/laptops/thinkpad-x1.png',
        'https://cdn.easyfrontend.com/pictures/laptops/thinkpad-x1-side.png',
        'https://cdn.easyfrontend.com/pictures/laptops/thinkpad-x1-back.png',
      ],
      category: 'laptops',
      description: '11th Gen Intel i7, 16GB RAM, 1TB SSD, 14" FHD+ Anti-glare display',
      colors: ['Black'],
      sizes: [
        { name: 'FHD', description: '1920x1080 resolution display' },
        { name: 'QHD', description: '2560x1440 resolution display' },
        { name: '4K', description: '3840x2160 resolution display' },
      ],
      rating: 4.7,
      reviewCount: 150,
      orderCount: 280,
    },
    {
      id: '5',
      title: 'RGB Gaming Headset',
      price: 89.99,
      image: 'https://cdn.easyfrontend.com/pictures/courses/courses19.jpg',
      format: 'New',
      category: 'audio'
    },
    {
      id: '6',
      title: 'High-End Graphics Card',
      price: 799.99,
      image: 'https://cdn.easyfrontend.com/pictures/courses/courses21.jpg',
      format: 'New',
      category: 'components'
    },
    {
      id: '7',
      title: 'Gaming PC Case',
      price: 149.99,
      image: 'https://cdn.easyfrontend.com/pictures/courses/courses20.jpg',
      format: 'New',
      category: 'components'
    },
    {
      id: '8',
      title: 'Gaming PC Case',
      price: 149.99,
      image: 'https://cdn.easyfrontend.com/pictures/courses/courses20.jpg',
      format: 'New',
      category: 'components'
    },
    {
      id: '9',
      title: 'Gaming PC Case',
      price: 149.99,
      image: 'https://cdn.easyfrontend.com/pictures/courses/courses20.jpg',
      format: 'New',
      category: 'components'
    },
    {
      id: '10',
      title: 'Corsair Vengeance RGB Pro 32GB',
      price: 159.99,
      image: 'https://cdn.easyfrontend.com/pictures/memory/corsair-rgb.jpg',
      category: 'memory',
      description: '32GB (2x16GB) DDR4 3200MHz C16 Desktop Memory',
      colors: ['Black'],
      rating: 4.8,
      reviewCount: 150,
      orderCount: 300,
    },
    {
      id: '11',
      title: 'G.SKILL Trident Z5 RGB 32GB',
      price: 189.99,
      image: 'https://cdn.easyfrontend.com/pictures/memory/gskill-rgb.jpg',
      category: 'memory',
      description: '32GB (2x16GB) DDR5 6000MHz Desktop Memory',
      colors: ['Black', 'Silver'],
      rating: 4.9,
      reviewCount: 120,
      orderCount: 250,
    },
  ];

  constructor() { }

  // Get all available categories
  getCategories(): string[] {
    const categories = new Set(this.products.map(product => product.category));
    return Array.from(categories);
  }

  // Get products by category
  getProductsByCategory(category: string): Observable<ProductModel[]> {
    const categoryLower = category.toLowerCase();
    const filteredProducts = this.products.filter(product =>
      product.category?.toLowerCase() === categoryLower
    );
    return of(filteredProducts);
  }

  // Get all products
  getAllProducts(): Observable<ProductModel[]> {
    return of(this.products);
  }

  // Filter products by multiple criteria
  filterProducts(filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    colors?: string[];
    search?: string;
  }): Observable<ProductModel[]> {
    let filteredProducts = [...this.products];

    if (filters.category) {
      const categoryLower = filters.category.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.category?.toLowerCase() === categoryLower
      );
      console.log('Filtering by category:', categoryLower, 'Results:', filteredProducts.length);
    }

    if (filters.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(product =>
        product.price >= filters.minPrice!
      );
    }

    if (filters.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(product =>
        product.price <= filters.maxPrice!
      );
    }

    if (filters.colors && filters.colors.length > 0) {
      filteredProducts = filteredProducts.filter(product =>
        product.colors?.some(color =>
          filters.colors!.includes(color)
        ) ?? false
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.title.toLowerCase().includes(searchLower) ||
        (product.description?.toLowerCase().includes(searchLower) ?? false)
      );
    }

    return of(filteredProducts);
  }
}
