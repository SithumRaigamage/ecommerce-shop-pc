
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Banner } from '../models/BannerModel';
import { HomeService } from '../services/home.service';
import { FeaturedProduct } from '../models/FeaturedProducts';
import { Catergory } from '../models/CatergoryModel';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  currentIndex = 0;
  currentBannerIndex = 0;
  private autoScrollInterval: any;
  banners: Banner[] = [];
  featuredProducts: FeaturedProduct[] = [];
  categories: Catergory[] = [];

  constructor(private homeService: HomeService) { }


  ngOnInit() {
    this.homeService.getBanners().subscribe(data => {
      //console.log('Banners fetched:', data);
      this.banners = data || [];  // Fallback to an empty array if data is null/undefined
    });
    this.homeService.getFeaturedProducts().subscribe(data => {
      this.featuredProducts = data || [];  // Fallback to an empty array if data is null/undefined
      console.log('FeaturedProducts:', this.featuredProducts);
    });
    this.homeService.getCategories().subscribe(data => {
      this.categories = data || [];  // Fallback to an empty array if data is null/undefined
      //console.log('Catergories:', this.categories);
    });


    this.startAutoScroll();
  }

  ngOnDestroy() {
    this.stopAutoScroll();
  }

  private startAutoScroll() {
    this.autoScrollInterval = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.featuredProducts.length;
      this.nextBanner();
    }, 5000); // Scroll every 2 minutes
  }

  private stopAutoScroll() {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
    }
  }

  nextBanner() {
    this.currentBannerIndex = (this.currentBannerIndex + 1) % this.banners.length;
  }

  prevBanner() {
    this.currentBannerIndex = (this.currentBannerIndex - 1 + this.banners.length) % this.banners.length;
  }

  selectBanner(index: number) {
    this.currentBannerIndex = index;
  }

  // Reset timer when manually changing slides
  onManualChange() {
    this.stopAutoScroll();
    this.startAutoScroll();
  }

  onMouseEnter() {
    this.stopAutoScroll();
  }

  onMouseLeave() {
    this.startAutoScroll();
  }
}
