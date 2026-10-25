import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AllJobPostingPlansComponent } from './all-job-posting-plans.component';
import { AllJobPostingPlansService } from './all-job-posting-plans.service';
import { CookieService } from 'ngx-cookie-service';
import { CommonService } from '../common-component/common.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { StripeService } from 'ngx-stripe';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

describe('AllJobPostingPlansComponent', () => {
  let component: AllJobPostingPlansComponent;
  let fixture: ComponentFixture<AllJobPostingPlansComponent>;
  let mockJobPlanService: jasmine.SpyObj<AllJobPostingPlansService>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockCommonService: any;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockStripeService: jasmine.SpyObj<StripeService>;

  beforeEach(async () => {
    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      prop: jasmine.createSpy('prop'),
      modal: jasmine.createSpy('modal'),
    });

    mockJobPlanService = jasmine.createSpyObj('AllJobPostingPlansService', ['getAllJobPostingPlans', 'JobPostPlanBuy']);
    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'set']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockStripeService = jasmine.createSpyObj('StripeService', ['confirmCardPayment']);

    mockCommonService = {
      platFormFee: signal(5),
      transferToConnectedAccount: jasmine.createSpy('transferToConnectedAccount').and.returnValue(
        of({ message: 'Success' })
      ),
      createPaymentIntent: jasmine.createSpy('createPaymentIntent').and.returnValue(
        of({ clientSecret: 'secret_123' })
      ),
      createPayment: jasmine.createSpy('createPayment').and.returnValue(
        of({ result: { success: true } })
      ),
    };

    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'CentreID') return '15';
      if (key === 'UserId') return '42';
      return '';
    });
    mockJobPlanService.getAllJobPostingPlans.and.returnValue(
      of({ message: 'Success', result: [{ id: 1, name: 'Plan A', price: 99 }] })
    );

    await TestBed.configureTestingModule({
      imports: [AllJobPostingPlansComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: AllJobPostingPlansService, useValue: mockJobPlanService },
        { provide: CookieService, useValue: mockCookieService },
        { provide: CommonService, useValue: mockCommonService },
        { provide: Router, useValue: mockRouter },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: StripeService, useValue: mockStripeService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(AllJobPostingPlansComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AllJobPostingPlansComponent);
    component = fixture.componentInstance;
  });

  it('should create the AllJobPostingPlansComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('Form setup & ngOnInit', () => {
    it('should initialize JobPostingPlanPaymentForm controls', () => {
      expect(component.JobPostingPlanPaymentForm.contains('planID')).toBeTrue();
      expect(component.JobPostingPlanPaymentForm.contains('price')).toBeTrue();
      expect(component.JobPostingPlanPaymentForm.contains('featureID')).toBeTrue();
    });

    it('should read cookies and call getAllJobPostingPlans on ngOnInit', () => {
      component.ngOnInit();

      expect(component.DaycareID).toBe('15');
      expect(component.UserID).toBe(42);
      expect(mockJobPlanService.getAllJobPostingPlans).toHaveBeenCalled();
      expect(component.AllJobPostingPlans.length).toBe(1);
    });
  });

  describe('JobPostPlanBuy', () => {
    it('should purchase plan successfully, update cookie, and navigate to /job-portal', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      mockJobPlanService.JobPostPlanBuy.and.returnValue(of({ message: 'Success', result: 5 }));

      component.JobPostPlanBuy(1, 10);
      tick();

      expect(mockJobPlanService.JobPostPlanBuy).toHaveBeenCalledWith({
        planID: 1,
        centreID: '15',
        featureID: 10,
        CentreAdminID: 42,
      });
      expect(mockCookieService.set).toHaveBeenCalledWith('jobPostCount', 5 as any);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/job-portal']);
    }));

    it('should show info dialog if already have job counts', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      mockJobPlanService.JobPostPlanBuy.and.returnValue(
        of({ message: 'Already have job counts', result: 3 })
      );

      component.JobPostPlanBuy(2, 10);
      tick();

      expect(Swal.fire).toHaveBeenCalledWith(
        jasmine.objectContaining({
          icon: 'info',
          title: 'Already have 3 job postings left',
        })
      );
    }));
  });

  describe('Payment Calculations & Stripe Interaction', () => {
    it('should calculate total from selected pending payments', () => {
      component.selectedPendingPayments = [{ totalPaidAmount: 50 }, { totalPaidAmount: 75 }];
      expect(component.calculateTotal()).toBe(125);
    });

    it('should create payment intent using CommonService', async () => {
      component.selectedPendingPayments = [{ totalPaidAmount: 100 }];
      const clientSecret = await component.createPaymentIntent();
      expect(clientSecret).toBe('secret_123');
    });

    it('should transfer to connected account', async () => {
      const response = await component.transferToConnectedAccount('pi_123', 10000);
      expect(mockCommonService.transferToConnectedAccount).toHaveBeenCalled();
      expect(response.message).toBe('Success');
    });

    it('should handle payment creation', async () => {
      component.JobPostingPlanPaymentForm.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
      });
      component.selectedPendingPayments = [{ totalPaidAmount: 50 }];

      const result = await component.handlePayment([1], 'pi_123', 'succeeded', 'pm_card', 'usd');

      expect(mockCommonService.createPayment).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('should show success alert on handlePaymentResponse', async () => {
      spyOn(Swal, 'fire');
      await component.handlePaymentResponse();
      expect(Swal.fire).toHaveBeenCalledWith(
        jasmine.objectContaining({ title: 'Success', icon: 'success' })
      );
    });
  });
});
