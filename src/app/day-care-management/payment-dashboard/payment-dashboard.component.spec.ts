import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentDashboardComponent } from './payment-dashboard.component';
import { PaymnetsService } from './paymnets.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../common-component/common.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

describe('PaymentDashboardComponent', () => {
  let component: PaymentDashboardComponent;
  let fixture: ComponentFixture<PaymentDashboardComponent>;
  let mockPaymentService: jasmine.SpyObj<PaymnetsService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockCommonService: jasmine.SpyObj<CommonService>;

  beforeEach(async () => {
    mockPaymentService = jasmine.createSpyObj('PaymnetsService', [
      'getAllSubscriptionPlans',
      'getAllMasterStatus',
      'getSubscriptionByID',
    ]);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['encrypt']);

    mockPaymentService.getAllSubscriptionPlans.and.returnValue(of({
      message: 'OK',
      result: [{ id: 1, planName: 'Gold' }],
    }));
    mockPaymentService.getAllMasterStatus.and.returnValue(of({
      message: 'OK',
      result: [{ id: 1, name: 'Active' }],
    }));

    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      val: jasmine.createSpy('val').and.returnValue(''),
    });

    await TestBed.configureTestingModule({
      imports: [PaymentDashboardComponent],
      providers: [
        { provide: PaymnetsService, useValue: mockPaymentService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: Router, useValue: mockRouter },
        { provide: CommonService, useValue: mockCommonService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: { get: () => null } },
            queryParams: of({}),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(PaymentDashboardComponent, {
        set: {
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(PaymentDashboardComponent);
    component = fixture.componentInstance;
    spyOn(component, 'initializeFlatpickr').and.stub();
  });

  it('should create PaymentDashboardComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call getAllSubscriptionPlans and getAllMasterStatus', () => {
      component.ngOnInit();
      expect(mockPaymentService.getAllSubscriptionPlans).toHaveBeenCalled();
      expect(mockPaymentService.getAllMasterStatus).toHaveBeenCalled();
      expect(component.getSubscriptionPlanList).toEqual([{ id: 1, planName: 'Gold' }]);
      expect(component.StatusList).toEqual([{ id: 1, name: 'Active' }]);
    });
  });

  describe('Filtering and Selection', () => {
    it('should handle selectStatus and trigger getAllSubscriptionPlans', () => {
      spyOn(component, 'getAllSubscriptionPlans');
      component.selectStatus(2);

      expect(component.selectedStatusFromDropDown).toBe('2');
      expect(component.paginationbo.status).toBe('2');
      expect(component.getAllSubscriptionPlans).toHaveBeenCalled();
    });

    it('should toggle isDateChecked on CheckBoxChecked', () => {
      expect(component.isDateChecked).toBeFalse();
      component.CheckBoxChecked('Date');
      expect(component.isDateChecked).toBeTrue();
      expect(component.selectedDate).toBeTrue();
    });

    it('should format date string correctly', () => {
      const date = new Date(2026, 3, 5); // April 5, 2026
      expect(component.formatDate(date)).toBe('2026-04-05');
    });

    it('should apply date filters when dates are selected', () => {
      component.DateFromFlatpicker = '2026-01-01';
      component.DateToFlatpicker = '2026-01-31';
      spyOn(component, 'getAllSubscriptionPlans');

      component.applyFilters({});

      expect(component.paginationbo.startDate).toBe('2026-01-01');
      expect(component.paginationbo.endDate).toBe('2026-01-31');
      expect(component.getAllSubscriptionPlans).toHaveBeenCalled();
    });

    it('should update pagination current page on filter by-pagination', () => {
      component.filter('by-pagination', 3);
      expect(component.paginationConfig.currentPage).toBe(3);
    });
  });

  describe('getAllSubscriptionPlans', () => {
    it('should handle search text and empty search text', () => {
      ((window as any).$ as jasmine.Spy).and.returnValue({
        val: jasmine.createSpy('val').and.returnValue('gold'),
      });

      component.getAllSubscriptionPlans();

      expect(component.paginationbo.searchText).toBe('gold');
      expect(mockPaymentService.getAllSubscriptionPlans).toHaveBeenCalled();
    });

    it('should set getSubscriptionPlanList to empty when Not found', () => {
      mockPaymentService.getAllSubscriptionPlans.and.returnValue(of({
        message: 'Not found',
        result: null,
      }));

      component.getAllSubscriptionPlans();

      expect(component.getSubscriptionPlanList).toEqual([]);
    });
  });

  describe('getSubscriptionByID', () => {
    it('should encrypt subscription id and navigate to view-invoice', () => {
      mockPaymentService.getSubscriptionByID.and.returnValue(of({
        message: 'OK',
        result: { id: 50 },
      }));
      mockCommonService.encrypt.and.returnValue('enc50');

      component.getSubscriptionByID(50);

      expect(mockCommonService.encrypt).toHaveBeenCalledWith('50');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/view-invoice'], { queryParams: { enc_id: 'enc50' } });
    });
  });
});
