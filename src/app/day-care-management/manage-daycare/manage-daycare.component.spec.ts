import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageDaycareComponent } from './manage-daycare.component';

describe('ManageDaycareComponent', () => {
  let component: ManageDaycareComponent;
  let fixture: ComponentFixture<ManageDaycareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageDaycareComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManageDaycareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
