import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BloomvieSubscriptionFeaturesComponent } from './bloomvie-subscription-features.component';

describe('BloomvieSubscriptionFeaturesComponent', () => {
  let component: BloomvieSubscriptionFeaturesComponent;
  let fixture: ComponentFixture<BloomvieSubscriptionFeaturesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BloomvieSubscriptionFeaturesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BloomvieSubscriptionFeaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
