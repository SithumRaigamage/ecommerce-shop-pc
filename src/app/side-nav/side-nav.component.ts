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
      "logo": "",
      "link": "/category/gaming",
      "text": "Console & Handheld Gaming"
    },
    {
      "id": 2,
      "logo": "",
      "link": "/category/storage",
      "text": "Storage"
    },
    {
      "id": 3,
      "logo": "",
      "link": "/category/laptop",
      "text": "Laptop"
    },
    {
      "id": 4,
      "logo": "",
      "link": "/category/accessories",
      "text": "Laptop & Monitor Accessories"
    },
    {
      "id": 5,
      "logo": "",
      "link": "/category/processor",
      "text": "Processor"
    },
    {
      "id": 6,
      "logo": "",
      "link": "/category/motherboards",
      "text": "Motherboards"
    },
    {
      "id": 7,
      "logo": "",
      "link": "/category/memory",
      "text": "Memory (RAM)"
    },
    {
      "id": 8,
      "logo": "",
      "link": "/category/graphics",
      "text": "Graphics Card"
    },
    {
      "id": 9,
      "logo": "",
      "link": "/category/power",
      "text": "Power Supply, UPS & Surge Protectors"
    },
    {
      "id": 10,
      "logo": "",
      "link": "/category/cooling",
      "text": "Cooling & Lighting"
    },
    {
      "id": 11,
      "logo": "",
      "link": "/category/cases",
      "text": "PC Cases"
    },
    {
      "id": 12,
      "logo": "",
      "link": "/category/monitors",
      "text": "Monitors"
    },
    {
      "id": 13,
      "logo": "",
      "link": "/category/audio",
      "text": "Speakers & Headsets"
    },
    {
      "id": 14,
      "logo": "",
      "link": "/category/peripherals",
      "text": "Keyboard & Mouse"
    },
    {
      "id": 15,
      "logo": "",
      "link": "/category/chairs",
      "text": "Gaming Chairs"
    },
    {
      "id": 16,
      "logo": "",
      "link": "/category/cables",
      "text": "Cables & Adapters"
    },
    {
      "id": 17,
      "logo": "",
      "link": "/category/external-storage",
      "text": "External Storage"
    },
    {
      "id": 18,
      "logo": "",
      "link": "/category/networking",
      "text": "Networking"
    },
    {
      "id": 19,
      "logo": "",
      "link": "/category/software",
      "text": "Gaming Software"
    },
    {
      "id": 20,
      "logo": "",
      "link": "/category/desktops",
      "text": "Desktop PCs"
    }
  ];

}
