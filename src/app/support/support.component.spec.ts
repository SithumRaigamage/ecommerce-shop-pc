import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SupportComponent } from './support.component';
import { TestModule } from '../testing/test-module';
import { FormBuilder } from '@angular/forms';

describe('SupportComponent', () => {
  let component: SupportComponent;
  let fixture: ComponentFixture<SupportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportComponent, TestModule],
      providers: [FormBuilder]
    }).compileComponents();

    fixture = TestBed.createComponent(SupportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // This will trigger ngOnInit and form initialization
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with required fields', () => {
    expect(component.form).toBeDefined();
    const controls = component.form.controls;

    expect(controls['name']).toBeTruthy();
    expect(controls['email']).toBeTruthy();
    expect(controls['message']).toBeTruthy();
  });

  it('should validate required fields', () => {
    const form = component.form;
    expect(form.valid).toBeFalsy();

    form.controls['name'].setValue('John');
    form.controls['email'].setValue('john@example.com');
    form.controls['message'].setValue('Test message');

    expect(form.valid).toBeTruthy();
  });
});
