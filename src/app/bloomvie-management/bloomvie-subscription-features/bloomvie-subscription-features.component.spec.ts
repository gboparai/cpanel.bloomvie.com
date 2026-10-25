import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BloomvieSubscriptionFeaturesComponent } from './bloomvie-subscription-features.component';

describe('BloomvieSubscriptionFeaturesComponent', () => {
  let component: BloomvieSubscriptionFeaturesComponent;
  let fixture: ComponentFixture<BloomvieSubscriptionFeaturesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BloomvieSubscriptionFeaturesComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(BloomvieSubscriptionFeaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
