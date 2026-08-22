import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewClassTeacherComponent } from './view-class-teacher.component';

describe('ViewClassTeacherComponent', () => {
  let component: ViewClassTeacherComponent;
  let fixture: ComponentFixture<ViewClassTeacherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewClassTeacherComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewClassTeacherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
