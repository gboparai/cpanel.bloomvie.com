import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionPlanJobsComponent } from './subscription-plan-jobs.component';

describe('SubscriptionPlanJobsComponent', () => {
  let component: SubscriptionPlanJobsComponent;
  let fixture: ComponentFixture<SubscriptionPlanJobsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionPlanJobsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SubscriptionPlanJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
