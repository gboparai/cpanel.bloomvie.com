import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionActivitiesComponent } from './subscription-activities.component';

describe('SubscriptionActivitiesComponent', () => {
  let component: SubscriptionActivitiesComponent;
  let fixture: ComponentFixture<SubscriptionActivitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionActivitiesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SubscriptionActivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
