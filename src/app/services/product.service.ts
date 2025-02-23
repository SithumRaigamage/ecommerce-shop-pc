import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';

import { ProductModel } from '../models/ProductModel';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private productsUrl = 'assets/json/products.json';

  constructor(private http: HttpClient) { }

  // Get all available categories
  getCategories(): Observable<string[]> {
    return this.http.get<ProductModel[]>(this.productsUrl).pipe(
      map(products => {
        console.log('Fetched products for categories:', products);
        const categories = new Set(products.map(product => product.category));
        const categoriesArray = Array.from(categories);
        console.log('Extracted categories:', categoriesArray);
        return categoriesArray;
      })
    );
  }

  // Get products by category
  getProductsByCategory(category: string): Observable<ProductModel[]> {
    return this.http.get<ProductModel[]>(this.productsUrl).pipe(
      map(products => {
        console.log('Fetched products for category filtering:', products);
        const filteredProducts = products.filter(product => product.category?.toLowerCase() === category.toLowerCase());
        console.log(`Filtered products for category "${category}":`, filteredProducts);
        return filteredProducts;
      })
    );
  }

  // Get all products
  getAllProducts(): Observable<ProductModel[]> {
    return this.http.get<ProductModel[]>(this.productsUrl).pipe(
      map(products => {
        console.log('Fetched all products:', products);
        return products;
      })
    );
  }

}
