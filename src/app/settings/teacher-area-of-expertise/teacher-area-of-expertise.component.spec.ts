import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherAreaOfExpertiseComponent } from './teacher-area-of-expertise.component';

describe('TeacherAreaOfExpertiseComponent', () => {
  let component: TeacherAreaOfExpertiseComponent;
  let fixture: ComponentFixture<TeacherAreaOfExpertiseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherAreaOfExpertiseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TeacherAreaOfExpertiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
