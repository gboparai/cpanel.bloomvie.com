import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewStudentEnrollmentComponent } from './view-student-enrollment.component';

describe('ViewStudentEnrollmentComponent', () => {
  let component: ViewStudentEnrollmentComponent;
  let fixture: ComponentFixture<ViewStudentEnrollmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewStudentEnrollmentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewStudentEnrollmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
