import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageClassEnrollmentComponent } from './manage-class-enrollment.component';

describe('ManageClassEnrollmentComponent', () => {
  let component: ManageClassEnrollmentComponent;
  let fixture: ComponentFixture<ManageClassEnrollmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageClassEnrollmentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManageClassEnrollmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
