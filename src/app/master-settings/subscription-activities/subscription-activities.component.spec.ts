import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubscriptionActivitiesComponent } from './subscription-activities.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('SubscriptionActivitiesComponent', () => {
  let component: SubscriptionActivitiesComponent;
  let fixture: ComponentFixture<SubscriptionActivitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionActivitiesComponent],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(SubscriptionActivitiesComponent, {
        set: {
          imports: [],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(SubscriptionActivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component instance', () => {
    expect(component).toBeTruthy();
  });

  it('should render header and table for subscription activities', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h5')?.textContent).toContain('View Subscription Activities');
    expect(compiled.querySelector('table')).toBeTruthy();
  });

  it('should render modal dialog for adding subscription activities', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const modal = compiled.querySelector('#exampleModal');
    expect(modal).toBeTruthy();
  });
});
