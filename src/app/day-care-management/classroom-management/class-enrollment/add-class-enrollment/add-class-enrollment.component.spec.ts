import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddClassEnrollmentComponent } from './add-class-enrollment.component';

describe('AddClassEnrollmentComponent', () => {
  let component: AddClassEnrollmentComponent;
  let fixture: ComponentFixture<AddClassEnrollmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddClassEnrollmentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddClassEnrollmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
