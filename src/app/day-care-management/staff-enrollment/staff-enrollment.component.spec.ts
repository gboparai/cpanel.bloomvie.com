import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffEnrollmentComponent } from './staff-enrollment.component';

describe('StaffEnrollmentComponent', () => {
  let component: StaffEnrollmentComponent;
  let fixture: ComponentFixture<StaffEnrollmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffEnrollmentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StaffEnrollmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
