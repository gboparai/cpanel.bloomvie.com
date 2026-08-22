import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageClassRosterComponent } from './manage-class-roster.component';

describe('ManageClassRosterComponent', () => {
  let component: ManageClassRosterComponent;
  let fixture: ComponentFixture<ManageClassRosterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageClassRosterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManageClassRosterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
