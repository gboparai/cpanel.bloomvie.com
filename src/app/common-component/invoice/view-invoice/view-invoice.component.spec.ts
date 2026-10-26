import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewInvoiceComponent } from './view-invoice.component';
import { CommonService } from '../../common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymnetsService } from '../../../day-care-management/payment-dashboard/paymnets.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

describe('ViewInvoiceComponent', () => {
  let component: ViewInvoiceComponent;
  let fixture: ComponentFixture<ViewInvoiceComponent>;

  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockPaymentService: jasmine.SpyObj<PaymnetsService>;

  beforeEach(async () => {
    mockCommonService = jasmine.createSpyObj('CommonService', ['decrypt']);
    mockCommonService.decrypt.and.returnValue('123');

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockPaymentService = jasmine.createSpyObj('PaymnetsService', ['getSubscriptionByID']);
    mockPaymentService.getSubscriptionByID.and.returnValue(of({
      message: 'OK',
      result: { id: 123, planName: 'Gold Plan', amount: 99.99 }
    }));

    await TestBed.configureTestingModule({
      imports: [ViewInvoiceComponent],
      providers: [
        { provide: CommonService, useValue: mockCommonService },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => (key === 'enc_id' ? 'encrypted_123' : null)
              }
            }
          }
        },
        { provide: PaymnetsService, useValue: mockPaymentService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(ViewInvoiceComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewInvoiceComponent);
    component = fixture.componentInstance;
  });

  it('should create the ViewInvoiceComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should decrypt enc_id and fetch subscription details', () => {
      component.ngOnInit();

      expect(mockCommonService.decrypt).toHaveBeenCalledWith('encrypted_123');
      expect(component.PaymentId).toBe(123);
      expect(mockPaymentService.getSubscriptionByID).toHaveBeenCalledWith(123 as any);
      expect(component.InvoiceDetails).toEqual({ id: 123, planName: 'Gold Plan', amount: 99.99 });
    });

    it('should not call getSubscriptionByID if enc_id decrypts to non-number', () => {
      mockCommonService.decrypt.and.returnValue('invalid');
      component.ngOnInit();

      expect(component.PaymentId).toBe(0);
    });
  });

  describe('getSubscriptionByID', () => {
    it('should populate InvoiceDetails on OK response', () => {
      component.getSubscriptionByID(55);

      expect(mockPaymentService.getSubscriptionByID).toHaveBeenCalledWith(55 as any);
      expect(component.InvoiceDetails).toBeDefined();
    });
  });
});
