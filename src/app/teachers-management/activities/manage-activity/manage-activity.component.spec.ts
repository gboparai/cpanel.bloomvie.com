import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ManageActivityComponent } from './manage-activity.component';

describe('ManageActivityComponent', () => {
  let component: ManageActivityComponent;
  let fixture: ComponentFixture<ManageActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageActivityComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(ManageActivityComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the Add Activity header', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const heading = compiled.querySelector('.heading-new h5');
    expect(heading?.textContent?.trim()).toBe('Add Activity');
  });

  it('should render form controls for activity name, time, description, and photos', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const form = compiled.querySelector('form');
    expect(form).not.toBeNull();

    const textInput = compiled.querySelector('input[type="text"]');
    expect(textInput).not.toBeNull();

    const selectEl = compiled.querySelector('select.form-select');
    expect(selectEl).not.toBeNull();

    const textarea = compiled.querySelector('textarea');
    expect(textarea).not.toBeNull();

    const fileInput = compiled.querySelector('input[type="file"]');
    expect(fileInput).not.toBeNull();
  });

  it('should render submit and cancel action buttons', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const submitBtn = compiled.querySelector('button.btn-primary');
    const cancelBtn = compiled.querySelector('button.btn-secondary');

    expect(submitBtn?.textContent?.trim()).toBe('Submit');
    expect(cancelBtn?.textContent?.trim()).toBe('Cancel');
  });
});
