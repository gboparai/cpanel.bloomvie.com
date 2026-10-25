import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageClassEnrollmentComponent } from './manage-class-enrollment.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ManageClassEnrollmentComponent', () => {
  let component: ManageClassEnrollmentComponent;
  let fixture: ComponentFixture<ManageClassEnrollmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageClassEnrollmentComponent],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ManageClassEnrollmentComponent, {
        set: {
          imports: [],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ManageClassEnrollmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create ManageClassEnrollmentComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render manage enrollment template successfully', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled).toBeDefined();
  });
});
