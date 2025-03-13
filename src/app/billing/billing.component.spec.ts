import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BillingComponent } from './billing.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

describe('BillingComponent', () => {
  let component: BillingComponent;
  let fixture: ComponentFixture<BillingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BillingComponent,
        RouterTestingModule
      ],
      providers: [{
        provide: ActivatedRoute,
        useValue: {
          paramMap: of(convertToParamMap({})),
          queryParamMap: of(convertToParamMap({}))
        }
      }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
