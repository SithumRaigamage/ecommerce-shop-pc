import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SideNavModule } from '../models/SideNavModule';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [RouterModule,CommonModule],
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})
export class SideNavComponent {

  navItems: SideNavModule[] = [
    {
      "id": 1,
      "logo": "fas fa-gamepad fa-3x",
      "link": "/category/gaming",
      "text": "Console & Handheld Gaming"
    },
    {
      "id": 2,
      "logo": "fas fa-hdd fa-3x",
      "link": "/category/storage",
      "text": "Storage"
    },
    {
      "id": 3,
      "logo": "fas fa-laptop fa-3x",
      "link": "/category/laptop",
      "text": "Laptop"
    },
    {
      "id": 4,
      "logo": "fas fa-desktop fa-3x",
      "link": "/category/accessories",
      "text": "Laptop & Monitor Accessories"
    },
    {
      "id": 5,
      "logo": "fas fa-microchip fa-3x",
      "link": "/category/processor",
      "text": "Processor"
    },
    {
      "id": 6,
      "logo": "fas fa-server fa-3x",
      "link": "/category/motherboards",
      "text": "Motherboards"
    },
    {
      "id": 7,
      "logo": "fas fa-memory fa-3x",
      "link": "/category/memory",
      "text": "Memory (RAM)"
    },
    {
      "id": 8,
      "logo": "fas fa-video fa-3x",
      "link": "/category/graphics",
      "text": "Graphics Card"
    },
    {
      "id": 9,
      "logo": "fas fa-plug fa-3x",
      "link": "/category/power",
      "text": "Power Supply, UPS & Surge Protectors"
    },
    {
      "id": 10,
      "logo": "fas fa-fan fa-3x",
      "link": "/category/cooling",
      "text": "Cooling & Lighting"
    },
    {
      "id": 11,
      "logo": "fas fa-box fa-3x",
      "link": "/category/cases",
      "text": "PC Cases"
    },
    {
      "id": 12,
      "logo": "fas fa-tv fa-3x",
      "link": "/category/monitors",
      "text": "Monitors"
    },
    {
      "id": 13,
      "logo": "fas fa-headphones fa-3x",
      "link": "/category/audio",
      "text": "Speakers & Headsets"
    },
    {
      "id": 14,
      "logo": "fas fa-keyboard fa-3x",
      "link": "/category/peripherals",
      "text": "Keyboard & Mouse"
    },
    {
      "id": 15,
      "logo": "fas fa-chair fa-3x",
      "link": "/category/chairs",
      "text": "Gaming Chairs"
    },
    {
      "id": 16,
      "logo": "fas fa-plug fa-3x",
      "link": "/category/cables",
      "text": "Cables & Adapters"
    },
    {
      "id": 17,
      "logo": "fas fa-usb fa-3x",
      "link": "/category/external-storage",
      "text": "External Storage"
    },
    {
      "id": 18,
      "logo": "fas fa-network-wired fa-3x",
      "link": "/category/networking",
      "text": "Networking"
    },
    {
      "id": 19,
      "logo": "fas fa-dice fa-3x",
      "link": "/category/software",
      "text": "Gaming Software"
    },
    {
      "id": 20,
      "logo": "fas fa-desktop fa-3x",
      "link": "/category/desktops",
      "text": "Desktop PCs"
    }
  ];

}
