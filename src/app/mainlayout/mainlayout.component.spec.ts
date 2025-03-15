import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainlayoutComponent } from './mainlayout.component';
import { TestModule } from '../testing/test.module';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('MainlayoutComponent', () => {
  let component: MainlayoutComponent;
  let fixture: ComponentFixture<MainlayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainlayoutComponent, TestModule],
      providers: [{
        provide: ActivatedRoute,
        useValue: {
          paramMap: of({}),
          snapshot: {
            paramMap: {
              get: () => null
            }
          }
        }
      }]
    }).compileComponents();

    fixture = TestBed.createComponent(MainlayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
