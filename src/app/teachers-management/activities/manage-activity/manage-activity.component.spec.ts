import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageActivityComponent } from './manage-activity.component';

describe('ManageActivityComponent', () => {
  let component: ManageActivityComponent;
  let fixture: ComponentFixture<ManageActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageActivityComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManageActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
