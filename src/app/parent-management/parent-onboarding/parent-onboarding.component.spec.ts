import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentOnboardingComponent } from './parent-onboarding.component';

describe('ParentOnboardingComponent', () => {
  let component: ParentOnboardingComponent;
  let fixture: ComponentFixture<ParentOnboardingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParentOnboardingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ParentOnboardingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
