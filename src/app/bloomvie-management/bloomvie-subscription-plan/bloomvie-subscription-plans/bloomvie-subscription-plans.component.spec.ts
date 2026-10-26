import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BloomvieSubscriptionPlansComponent } from './bloomvie-subscription-plans.component';

describe('BloomvieSubscriptionPlansComponent', () => {
  let component: BloomvieSubscriptionPlansComponent;
  let fixture: ComponentFixture<BloomvieSubscriptionPlansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BloomvieSubscriptionPlansComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(BloomvieSubscriptionPlansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
