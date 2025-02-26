import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { Banner } from '../models/BannerModel';
import { FeaturedProduct } from '../models/FeaturedProducts';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(private http: HttpClient) {}

  getBanners(): Observable<Banner[]> {
    // Adjust this to the correct URL where your JSON is hosted
    return this.http.get<Banner[]>('assets/json/banner.json');  // For local JSON
  }

  getFeaturedProducts(): Observable<FeaturedProduct[]> {
    return this.http.get<FeaturedProduct[]>('assets/json/featuredProducts.json');
  }

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>('assets/json/categories.json');
  }

}
