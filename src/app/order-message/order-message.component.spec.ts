import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderMessageComponent } from './order-message.component';

describe('OrderMessageComponent', () => {
  let component: OrderMessageComponent;
  let fixture: ComponentFixture<OrderMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderMessageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
