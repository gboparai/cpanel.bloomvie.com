import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewClassroomComponent } from './view-classroom.component';

describe('ViewClassroomComponent', () => {
  let component: ViewClassroomComponent;
  let fixture: ComponentFixture<ViewClassroomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewClassroomComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewClassroomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
