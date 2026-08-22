import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageParentComponent } from './manage-parent.component';

describe('ManageParentComponent', () => {
  let component: ManageParentComponent;
  let fixture: ComponentFixture<ManageParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageParentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManageParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
