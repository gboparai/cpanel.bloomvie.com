import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StaffEnrollmentComponent } from './staff-enrollment.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('StaffEnrollmentComponent', () => {
  let component: StaffEnrollmentComponent;
  let fixture: ComponentFixture<StaffEnrollmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffEnrollmentComponent],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(StaffEnrollmentComponent, {
        set: {
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(StaffEnrollmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the StaffEnrollmentComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render breadcrumb or host container element', () => {
    expect(fixture.nativeElement).toBeTruthy();
  });
});
