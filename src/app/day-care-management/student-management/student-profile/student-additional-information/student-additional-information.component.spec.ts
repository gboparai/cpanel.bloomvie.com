import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentAdditionalInformationComponent } from './student-additional-information.component';

describe('StudentAdditionalInformationComponent', () => {
  let component: StudentAdditionalInformationComponent;
  let fixture: ComponentFixture<StudentAdditionalInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentAdditionalInformationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StudentAdditionalInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
