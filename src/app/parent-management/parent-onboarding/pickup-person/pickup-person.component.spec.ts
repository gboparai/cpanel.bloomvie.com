import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { PickupPersonComponent } from './pickup-person.component';

describe('PickupPersonComponent', () => {
  let component: PickupPersonComponent;
  let fixture: ComponentFixture<PickupPersonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PickupPersonComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(PickupPersonComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(PickupPersonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render Authorized Pick-Up Persons heading', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const heading = compiled.querySelector('.heading-new h5');
    expect(heading?.textContent?.trim()).toBe('Authorized Pick-Up Persons');
  });

  it('should render form controls for pickup person details', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const selectEl = compiled.querySelector('select.form-select');
    expect(selectEl).not.toBeNull();

    const textInputs = compiled.querySelectorAll('input[type="text"]');
    expect(textInputs.length).toBeGreaterThanOrEqual(4);

    const textareas = compiled.querySelectorAll('textarea');
    expect(textareas.length).toBe(2);

    const fileInput = compiled.querySelector('input[type="file"]');
    expect(fileInput).not.toBeNull();
  });

  it('should render action buttons for submit and cancel', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const submitBtn = compiled.querySelector('button.btn-primary');
    const cancelBtn = compiled.querySelector('button.btn-secondary');

    expect(submitBtn?.textContent?.trim()).toBe('Submit');
    expect(cancelBtn?.textContent?.trim()).toBe('Cancel');
  });
});
