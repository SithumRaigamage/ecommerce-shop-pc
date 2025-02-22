import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  backgroundColor: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  badge?: {
    text: string;
    color: string;
  };
}

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

  banners: Banner[] = [
    {
      id: 1,
      title: "Build Your Dream Gaming PC",
      subtitle: "Customize your perfect gaming rig with our premium components",
      buttonText: "Start Building",
      buttonLink: "/build",
      image: "https://images.unsplash.com/photo-1587202372616-b43abea06c2a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      backgroundColor: "bg-gradient-to-r from-purple-900 to-indigo-800"
    },
    {
      id: 2,
      title: "Latest RTX 4000 Series",
      subtitle: "Experience next-gen gaming with NVIDIA's most powerful GPUs",
      buttonText: "Shop GPUs",
      buttonLink: "/category/graphics-cards",
      image: "https://images.unsplash.com/photo-1591405351990-4726e331f141?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      backgroundColor: "bg-gradient-to-r from-green-900 to-emerald-800"
    },
    {
      id: 3,
      title: "Pro Creator Workstations",
      subtitle: "Purpose-built PCs for content creation and 3D rendering",
      buttonText: "Explore Workstations",
      buttonLink: "/category/workstations",
      image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1442&q=80",
      backgroundColor: "bg-gradient-to-r from-blue-900 to-cyan-800"
    },
    {
      id: 4,
      title: "Summer Gaming Sale",
      subtitle: "Save up to 30% on selected gaming peripherals",
      buttonText: "View Deals",
      buttonLink: "/deals",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      backgroundColor: "bg-gradient-to-r from-red-900 to-orange-800"
    }
  ];

  products: Product[] = [
    {
      id: 1,
      name: 'High-Performance Laptop',
      description: 'Powerful and sleek for all your computing needs',
      price: 1299,
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80',
      badge: {
        text: 'New',
        color: 'bg-red-500'
      }
    },
    {
      id: 2,
      name: 'Wireless Gaming Mouse',
      description: 'Precision and comfort for extended gaming sessions',
      price: 79,
      oldPrice: 99,
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1528&q=80',
      badge: {
        text: 'Sale',
        color: 'bg-green-500'
      }
    },
    {
      id: 3,
      name: '4K Gaming Monitor',
      description: 'Immersive visuals with high refresh rate',
      price: 499,
      image: 'https://images.unsplash.com/photo-1616763355603-9755a640a287?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      badge: {
        text: 'Popular',
        color: 'bg-purple-500'
      }
    },
    {
      id: 4,
      name: 'Mechanical Keyboard',
      description: 'Premium mechanical switches for the best typing experience',
      price: 159,
      image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80',
      badge: {
        text: 'Best Seller',
        color: 'bg-yellow-500'
      }
    },
    {
      id: 5,
      name: 'Gaming Headset',
      description: '7.1 Surround sound for immersive gaming',
      price: 129,
      oldPrice: 149,
      image: 'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      badge: {
        text: 'Sale',
        color: 'bg-green-500'
      }
    }
  ];

  visibleProducts: Product[] = [];
  productsToShow = 3;

  ngOnInit() {
    this.updateVisibleProducts();
    this.startAutoScroll();
  }

  ngOnDestroy() {
    this.stopAutoScroll();
  }

  private updateVisibleProducts() {
    this.visibleProducts = [];
    for (let i = 0; i < this.productsToShow; i++) {
      const index = (this.currentIndex + i) % this.products.length;
      this.visibleProducts.push(this.products[index]);
    }
  }

  private startAutoScroll() {
    this.autoScrollInterval = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.products.length;
      this.updateVisibleProducts();
      this.nextBanner();
    }, 120000); // Scroll every 2 minutes
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
