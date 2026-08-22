import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterFeaturesComponent } from './master-features.component';

describe('MasterFeaturesComponent', () => {
  let component: MasterFeaturesComponent;
  let fixture: ComponentFixture<MasterFeaturesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterFeaturesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MasterFeaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
