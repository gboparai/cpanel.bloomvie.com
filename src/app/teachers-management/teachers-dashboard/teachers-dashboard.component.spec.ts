import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeachersDashboardComponent } from './teachers-dashboard.component';

describe('TeachersDashboardComponent', () => {
  let component: TeachersDashboardComponent;
  let fixture: ComponentFixture<TeachersDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeachersDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TeachersDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
