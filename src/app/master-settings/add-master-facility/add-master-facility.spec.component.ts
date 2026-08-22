import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMasterFacilityComponent } from './add-master-facility.component';

describe('AddFacilityComponent', () => {
  let component: AddMasterFacilityComponent;
  let fixture: ComponentFixture<AddMasterFacilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMasterFacilityComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddMasterFacilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
