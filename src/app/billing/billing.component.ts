import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-billing',
  imports: [CommonModule, ReactiveFormsModule,RouterModule],
  templateUrl: './billing.component.html',
  styleUrl: './billing.component.css'
})
export class BillingComponent implements OnInit {
  title: string = '';
  total: number = 0;
  items: any[] = [];
  selectedPaymentMethod: string = '';
  billingForm!: FormGroup;
  paymentForm!: FormGroup;

  constructor(private route: ActivatedRoute, private fb: FormBuilder) {}

  ngOnInit() {
    const state = history.state;
    this.total = state.total || 0;
    this.items = state.items || [];
    console.log('Billing details:', this.items);

    this.billingForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      country: ['', Validators.required],
      address: ['', Validators.required],
      post: ['', Validators.required],
      phone: ['', Validators.required]
    });

    this.paymentForm = this.fb.group({
      cardNumber: ['', Validators.required],
      terms: [false, Validators.requiredTrue]
    });
  }

  selectPaymentMethod(method: string) {
    this.selectedPaymentMethod = this.selectedPaymentMethod === method ? '' : method;
  }

  onSubmit() {
    if (this.billingForm.valid && (this.selectedPaymentMethod !== 'card' || this.paymentForm.valid)) {
      // Handle form submission
      console.log('Billing Form:', this.billingForm.value);
      console.log('Payment Form:', this.paymentForm.value);
      console.log('Selected Payment Method:', this.selectedPaymentMethod);
      console.log('Form submitted successfully');
    } else {
      console.log('Form validation failed');
    }
  }
}
