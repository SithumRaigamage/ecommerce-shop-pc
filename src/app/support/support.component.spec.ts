import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SupportComponent } from './support.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('SupportComponent', () => {
  let component: SupportComponent;
  let fixture: ComponentFixture<SupportComponent>;
  let formBuilder: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SupportComponent,
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientTestingModule
      ],
      providers: [
        FormBuilder
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupportComponent);
    component = fixture.componentInstance;
    formBuilder = TestBed.inject(FormBuilder);

    // Initialize the form using the actual property name from SupportComponent
    if ('form' in component) {
      (component as any).form = formBuilder.group({
        name: [''],
        email: [''],
        message: ['']
      });
    }

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
