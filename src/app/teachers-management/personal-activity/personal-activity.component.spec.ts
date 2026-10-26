import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { PersonalActivityComponent } from './personal-activity.component';

describe('PersonalActivityComponent', () => {
  let component: PersonalActivityComponent;
  let fixture: ComponentFixture<PersonalActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalActivityComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(PersonalActivityComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the Add Activity header and activity type icons', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const heading = compiled.querySelector('.heading-new h5');
    expect(heading?.textContent?.trim()).toBe('Add Activity');

    const icons = compiled.querySelectorAll('.activity-icons .icon-box');
    expect(icons.length).toBe(7);
  });

  it('should render form controls for activity entry', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const timeInputs = compiled.querySelectorAll('input[type="time"]');
    expect(timeInputs.length).toBe(2);

    const textarea = compiled.querySelector('textarea');
    expect(textarea).not.toBeNull();

    const dateInput = compiled.querySelector('input[type="date"]');
    expect(dateInput).not.toBeNull();

    const fileInput = compiled.querySelector('input[type="file"]');
    expect(fileInput).not.toBeNull();
  });

  it('should render student table with checkboxes and actions', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const table = compiled.querySelector('.student-table');
    expect(table).not.toBeNull();

    const rows = compiled.querySelectorAll('.student-table tbody tr');
    expect(rows.length).toBe(5);
  });

  it('should render Add and Cancel buttons', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const addBtn = compiled.querySelector('button.btn-primary');
    const cancelBtn = compiled.querySelector('button.btn-secondary');

    expect(addBtn?.textContent?.trim()).toBe('Add');
    expect(cancelBtn?.textContent?.trim()).toBe('Cancel');
  });
});
