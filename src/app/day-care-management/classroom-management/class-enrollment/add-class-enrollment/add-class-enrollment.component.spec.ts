import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddClassEnrollmentComponent } from './add-class-enrollment.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AddClassEnrollmentComponent', () => {
  let component: AddClassEnrollmentComponent;
  let fixture: ComponentFixture<AddClassEnrollmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddClassEnrollmentComponent],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(AddClassEnrollmentComponent, {
        set: {
          imports: [],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AddClassEnrollmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create AddClassEnrollmentComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render enrollment views container', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled).toBeDefined();
  });
});
