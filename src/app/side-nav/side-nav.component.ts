import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

interface SubNavItem {
  text: string;
  link: string;
}

interface NavItem {
  text: string;
  link: string;
  icon: string;
  isExpanded: boolean;
  width: string;
  height: string;
  counter?: string;
  subItems?: SubNavItem[];
}

const ICON_SIZE = {
  width: '40px',
  height: '40px'
} as const;

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [RouterModule,CommonModule],
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})
export class SideNavComponent {
  isExpanded = false;

  toggleSidenav() {
    this.isExpanded = !this.isExpanded;
    // When collapsing sidenav, collapse all expanded items
    if (!this.isExpanded) {
      this.mainNavItems.forEach(item => item.isExpanded = false);
    }
  }

  toggleItem(item: NavItem, event: Event) {
    event.preventDefault();
    event.stopPropagation();

    if (item.subItems?.length) {
      // If sidebar is collapsed, expand it first
      if (!this.isExpanded) {
        this.isExpanded = true;
        // Wait for sidebar expansion before expanding item
        setTimeout(() => {
          item.isExpanded = !item.isExpanded;
        }, 100);
      } else {
        item.isExpanded = !item.isExpanded;
      }
    }
  }

  // Helper method to check if item has subitems
  hasSubItems(item: NavItem): boolean {
    return item.subItems !== undefined && item.subItems.length > 0;
  }

  mainNavItems: NavItem[] = [
    {
      text: 'Laptops',
      link: '/category/laptops',
      icon: '/assets/icons/laptop.svg',
      isExpanded: false,
      width: ICON_SIZE.width,
      height: ICON_SIZE.height,
      counter: '18',
      subItems: [
        { text: 'Gaming Laptops', link: '/category/laptops/gaming' },
        { text: 'Business Laptops', link: '/category/laptops/business' },
        { text: 'Student Laptops', link: '/category/laptops/student' }
      ]
    },
    {
      text: 'Laptop & Monitor Accessories',
      link: '/category/accessories',
      icon: '/assets/icons/monitor.svg',
      isExpanded: false,
      width: ICON_SIZE.width,
      height: ICON_SIZE.height,
      counter: '4'
    },
    {
      text: 'Processors',
      link: '/category/processors',
      icon: '/assets/icons/processor.svg',
      isExpanded: false,
      width: ICON_SIZE.width,
      height: ICON_SIZE.height,
      counter: '18'
    },
    {
      text: 'Motherboards',
      link: '/category/motherboards',
      icon: '/assets/icons/motherboard.svg',
      isExpanded: false,
      width: ICON_SIZE.width,
      height: ICON_SIZE.height,
      counter: '18'
    },
    {
      text: 'Memory (RAM)',
      link: '/category/memory',
      icon: '/assets/icons/ram.svg',
      isExpanded: false,
      width: ICON_SIZE.width,
      height: ICON_SIZE.height,
      counter: '18'
    },
    {
      text: 'Graphics Cards',
      link: '/category/graphics-cards',
      icon: '/assets/icons/gpu.svg',
      isExpanded: false,
      width: ICON_SIZE.width,
      height: ICON_SIZE.height,
      counter: '18'
    },
    {
      text: 'Power Supplies',
      link: '/category/power-supplies',
      icon: '/assets/icons/psu.svg',
      isExpanded: false,
      width: ICON_SIZE.width,
      height: ICON_SIZE.height,
      counter: '4'
    },
    {
      text: 'Cooling & Lighting',
      link: '/category/cooling',
      icon: '/assets/icons/cooling.svg',
      isExpanded: false,
      width: ICON_SIZE.width,
      height: ICON_SIZE.height,
      counter: '4'
    },
    {
      text: 'Storage & NAS',
      link: '/category/storage',
      icon: '/assets/icons/storage.svg',
      isExpanded: false,
      width: ICON_SIZE.width,
      height: ICON_SIZE.height,
      counter: '4'
    },
    {
      text: 'Cases',
      link: '/category/cases',
      icon: '/assets/icons/case.svg',
      isExpanded: false,
      width: ICON_SIZE.width,
      height: ICON_SIZE.height,
      counter: '4'
    },
    {
      text: 'Monitors',
      link: '/category/monitors',
      icon: '/assets/icons/monitor.svg',
      isExpanded: false,
      width: ICON_SIZE.width,
      height: ICON_SIZE.height,
      counter: '4'
    }
  ];

  readonly settingsNavItems: ReadonlyArray<NavItem> = [
    {
      text: 'Settings',
      link: '/category/settings',
      icon: '/assets/icons/gear.svg',
      isExpanded: false,
      width: ICON_SIZE.width,
      height: ICON_SIZE.height,
      counter: '4'
    },
    {
      text: 'Account',
      link: '/category/account',
      icon: '/assets/icons/user.svg',
      isExpanded: false,
      width: ICON_SIZE.width,
      height: ICON_SIZE.height,
      counter: '4'
    }
  ];
}
