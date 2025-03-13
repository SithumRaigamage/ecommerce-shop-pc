import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductorderComponent } from './checkout.component';

describe('ProductorderComponent', () => {
  let component: ProductorderComponent;
  let fixture: ComponentFixture<ProductorderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductorderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
