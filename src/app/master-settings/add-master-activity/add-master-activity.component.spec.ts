import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMasterActivityComponent } from './add-master-activity.component';

describe('AddMasterActivityComponent', () => {
  let component: AddMasterActivityComponent;
  let fixture: ComponentFixture<AddMasterActivityComponent>;
 
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMasterActivityComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddMasterActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
