import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewClassEnrollmentComponent } from './view-class-enrollment.component';

describe('ViewClassEnrollmentComponent', () => {
  let component: ViewClassEnrollmentComponent;
  let fixture: ComponentFixture<ViewClassEnrollmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewClassEnrollmentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewClassEnrollmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
