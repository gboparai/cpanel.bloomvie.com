import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageClassroomComponent } from './manage-classroom.component';

describe('ManageClassroomComponent', () => {
  let component: ManageClassroomComponent;
  let fixture: ComponentFixture<ManageClassroomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageClassroomComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManageClassroomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
