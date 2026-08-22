  import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionFeaturesComponent } from './subscription-features.component';

describe('SubscriptionFeaturesComponent', () => {
  let component: SubscriptionFeaturesComponent;
  let fixture: ComponentFixture<SubscriptionFeaturesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionFeaturesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SubscriptionFeaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
