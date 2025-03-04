import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-billing',
  imports: [CommonModule],
  templateUrl: './billing.component.html',
  styleUrl: './billing.component.css'
})
export class BillingComponent implements OnInit {
  title: string = '';
  total: number = 0;
  items: any[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const state = history.state;
    this.total = state.total || 0;
    this.items = state.items || [];
    console.log('Billing details:', this.items);
  }
}
