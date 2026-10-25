import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { SubscriptionPlanJobsComponent } from './subscription-plan-jobs.component';

describe('SubscriptionPlanJobsComponent', () => {
  let component: SubscriptionPlanJobsComponent;
  let fixture: ComponentFixture<SubscriptionPlanJobsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionPlanJobsComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SubscriptionPlanJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
