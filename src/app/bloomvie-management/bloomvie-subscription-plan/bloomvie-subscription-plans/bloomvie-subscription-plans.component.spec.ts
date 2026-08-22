import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BloomvieSubscriptionPlansComponent } from './bloomvie-subscription-plans.component';

describe('BloomvieSubscriptionPlansComponent', () => {
  let component: BloomvieSubscriptionPlansComponent;
  let fixture: ComponentFixture<BloomvieSubscriptionPlansComponent>;
 
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BloomvieSubscriptionPlansComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BloomvieSubscriptionPlansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
