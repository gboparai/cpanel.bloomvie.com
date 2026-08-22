import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditClassEnrollmentComponent } from './edit-class-enrollment.component';

describe('EditClassEnrollmentComponent', () => {
  let component: EditClassEnrollmentComponent;
  let fixture: ComponentFixture<EditClassEnrollmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditClassEnrollmentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditClassEnrollmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
