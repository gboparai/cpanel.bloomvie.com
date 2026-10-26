import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BookKeepingComponent } from './book-keeping.component';
import { BookKeepingService } from './book-keeping.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

describe('BookKeepingComponent', () => {
  let component: BookKeepingComponent;
  let fixture: ComponentFixture<BookKeepingComponent>;

  let mockBookKeepingService: jasmine.SpyObj<BookKeepingService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockDatePipe: jasmine.SpyObj<DatePipe>;
  let mockCookieService: jasmine.SpyObj<CookieService>;

  beforeEach(async () => {
    mockBookKeepingService = jasmine.createSpyObj('BookKeepingService', [
      'getSubscriptionDetails',
      'getUpcomingPaymentDetails',
      'getInvoice'
    ]);
    mockBookKeepingService.getSubscriptionDetails.and.returnValue(of({
      message: 'OK',
      result: [
        {
          id: 1,
          subscriptionFee: 100,
          paymentReceipt: 'receipt.pdf'
        }
      ]
    }));
    mockBookKeepingService.getUpcomingPaymentDetails.and.returnValue(of({
      message: 'OK',
      result: [
        {
          id: 2,
          amount: 150
        }
      ]
    }));
    mockBookKeepingService.getInvoice.and.returnValue(of({
      message: 'OK',
      result: 'base64EncodedInvoice'
    }));

    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockDatePipe = jasmine.createSpyObj('DatePipe', ['transform']);
    mockDatePipe.transform.and.returnValue('2026-05-15');

    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'set', 'delete', 'check']);
    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'UserRoleId') return '3';
      if (key === 'UserId') return '101';
      return '';
    });

    await TestBed.configureTestingModule({
      imports: [BookKeepingComponent],
      providers: [
        { provide: BookKeepingService, useValue: mockBookKeepingService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: DatePipe, useValue: mockDatePipe },
        { provide: CookieService, useValue: mockCookieService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(BookKeepingComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookKeepingComponent);
    component = fixture.componentInstance;
  });

  it('should create the BookKeepingComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should read cookie values and fetch subscription details', () => {
      spyOn(component, 'intitDatePicker').and.callFake(() => {});
      spyOn(component, 'intitDatePicker2').and.callFake(() => {});

      component.ngOnInit();

      expect(component.userRoleId).toBe(3);
      expect(component.userID).toBe(101);
      expect(mockBookKeepingService.getSubscriptionDetails).toHaveBeenCalled();
      expect(component.intitDatePicker).toHaveBeenCalled();
      expect(component.intitDatePicker2).toHaveBeenCalled();
    });
  });

  describe('SubscriptionDetailsOnLogin', () => {
    it('should populate SubscriptionDetailsList on success', () => {
      component.SubscriptionDetailsOnLogin('2026-05-01', '2026-05-31', 'Test', 3, 101);

      expect(component.SubscriptionDetailsList.length).toBe(1);
      expect(component.SubscriptionDetailsList[0].id).toBe(1);
      expect(component.skeletonShow).toBe('');
    });

    it('should default undefined parameters to empty strings', () => {
      component.SubscriptionDetailsOnLogin(undefined, undefined, undefined, 3, 101);
      expect(mockBookKeepingService.getSubscriptionDetails).toHaveBeenCalledWith('', '', '', 3, 101);
    });
  });

  describe('getUpcomingPaymentDetails', () => {
    it('should fetch and populate UpcomingPaymentsList', () => {
      component.getUpcomingPaymentDetails('2026-05-01', '2026-05-31', 'Test', 3, 101);

      expect(mockBookKeepingService.getUpcomingPaymentDetails).toHaveBeenCalled();
      expect(component.UpcomingPaymentsList.length).toBe(1);
      expect(component.skeletonShow).toBe('');
    });
  });

  describe('getS3FileName and base64ToBlob', () => {
    it('should extract filename correctly from S3 url', () => {
      const name = component.getS3FileName('https://bucket.s3.com/folder/invoice123.pdf');
      expect(name).toBe('invoice123.pdf');
    });

    it('should convert base64 to Blob', () => {
      const base64 = 'SGVsbG8gV29ybGQ=';
      const blob = component.base64ToBlob(base64, 'text/plain');
      expect(blob).toBeDefined();
      expect(blob.type).toBe('text/plain');
    });
  });

  describe('Search methods', () => {
    it('should trigger SubscriptionDetailsOnLogin on onSearchName', () => {
      const spy = spyOn(component, 'SubscriptionDetailsOnLogin').and.callThrough();
      component.onSearchName();
      expect(spy).toHaveBeenCalled();
    });

    it('should trigger getUpcomingPaymentDetails on onSearchName2', () => {
      const spy = spyOn(component, 'getUpcomingPaymentDetails').and.callThrough();
      component.onSearchName2();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('downloadInvoice and downloadFile', () => {
    it('should fetch invoice and trigger blob download', () => {
      component.downloadInvoice('ORDER-123');
      expect(mockBookKeepingService.getInvoice).toHaveBeenCalledWith('ORDER-123');
    });

    it('should call window.open in downloadFile', () => {
      const spy = spyOn(window, 'open').and.callFake(() => null);
      component.downloadFile('http://example.com/file.pdf');
      expect(spy).toHaveBeenCalledWith('http://example.com/file.pdf', '_blank');
    });
  });
});
