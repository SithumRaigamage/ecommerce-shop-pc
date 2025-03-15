import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class SupportComponent implements OnInit {

  contactForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      issueType: ['', Validators.required],
      productModel: ['', Validators.required],
      priority: ['', Validators.required],
      description: ['', Validators.required],
      screenshots: [''],
      documents: ['']
    });
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      console.log(this.contactForm.value);
      // Handle form submission logic here
    } else {
      // Mark all fields as touched to trigger validation display
      Object.keys(this.contactForm.controls).forEach(key => {
        const control = this.contactForm.get(key);
        control?.markAsTouched();
      });
    }
  }
}
