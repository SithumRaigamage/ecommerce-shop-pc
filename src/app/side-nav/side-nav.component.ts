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
      "link": "",
      "text": "Console & Handheld Gaming"
    },
    {
      "id": 2,
      "logo": "",
      "link": "",
      "text": "Storage"
    },
    {
      "id": 3,
      "logo": "",
      "link": "",
      "text": "Laptop"
    },
    {
      "id": 4,
      "logo": "",
      "link": "",
      "text": "Laptop & Monitor Accessories"
    },
    {
      "id": 5,
      "logo": "",
      "link": "",
      "text": "Processor"
    },
    {
      "id": 6,
      "logo": "",
      "link": "",
      "text": "Motherboards"
    },
    {
      "id": 7,
      "logo": "",
      "link": "",
      "text": "Memory (RAM)"
    },
    {
      "id": 8,
      "logo": "",
      "link": "",
      "text": "Graphics Card"
    },
    {
      "id": 9,
      "logo": "",
      "link": "",
      "text": "Power Supply, UPS & Surge Protectors"
    },
    {
      "id": 10,
      "logo": "",
      "link": "",
      "text": "Cooling & Lighting"
    },
    {
      "id": 11,
      "logo": "",
      "link": "",
      "text": "PC Cases"
    },
    {
      "id": 12,
      "logo": "",
      "link": "",
      "text": "Monitors"
    },
    {
      "id": 13,
      "logo": "",
      "link": "",
      "text": "Speakers & Headsets"
    },
    {
      "id": 14,
      "logo": "",
      "link": "",
      "text": "Keyboard & Mouse"
    },
    {
      "id": 15,
      "logo": "",
      "link": "",
      "text": "Gaming Chairs"
    },
    {
      "id": 16,
      "logo": "",
      "link": "",
      "text": "Cables & Adapters"
    },
    {
      "id": 17,
      "logo": "",
      "link": "",
      "text": "External Storage"
    },
    {
      "id": 18,
      "logo": "",
      "link": "",
      "text": "Networking"
    },
    {
      "id": 19,
      "logo": "",
      "link": "",
      "text": "Gaming Software"
    },
    {
      "id": 20,
      "logo": "",
      "link": "",
      "text": "Desktop PCs"
    }
  ];

}
