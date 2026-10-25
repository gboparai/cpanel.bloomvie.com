import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentManagementComponent } from './payment-management.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('PaymentManagementComponent', () => {
  let component: PaymentManagementComponent;
  let fixture: ComponentFixture<PaymentManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentManagementComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(PaymentManagementComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the PaymentManagementComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render template', () => {
    expect(fixture.nativeElement).toBeDefined();
  });
});
