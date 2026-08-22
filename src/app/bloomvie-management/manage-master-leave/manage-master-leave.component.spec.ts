import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageMasterLeaveComponent } from './manage-master-leave.component';

describe('ManageMasterLeaveComponent', () => {
  let component: ManageMasterLeaveComponent;
  let fixture: ComponentFixture<ManageMasterLeaveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageMasterLeaveComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManageMasterLeaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
