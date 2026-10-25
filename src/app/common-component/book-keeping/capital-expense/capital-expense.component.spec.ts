import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CapitalExpenseComponent } from './capital-expense.component';
import { CapitalExpenseService } from './capital-expense.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonService } from '../../common.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

describe('CapitalExpenseComponent', () => {
  let component: CapitalExpenseComponent;
  let fixture: ComponentFixture<CapitalExpenseComponent>;

  let mockService: jasmine.SpyObj<CapitalExpenseService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockDatePipe: jasmine.SpyObj<DatePipe>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockSanitizer: jasmine.SpyObj<DomSanitizer>;
  let mockCommonService: jasmine.SpyObj<CommonService>;

  beforeEach(async () => {
    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal')
    });

    mockService = jasmine.createSpyObj('CapitalExpenseService', [
      'getAllExpensesListBasedOnType',
      'getSuuplyRequest'
    ]);
    mockService.getAllExpensesListBasedOnType.and.returnValue(of({
      message: 'OK',
      result: [
        {
          id: 1,
          expenseName: 'Laptops',
          amount: 5000,
          receiptImage: 'receipt.pdf'
        }
      ]
    }));

    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);

    mockDatePipe = jasmine.createSpyObj('DatePipe', ['transform']);
    mockDatePipe.transform.and.returnValue('2026-05-15');

    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'set', 'delete', 'check']);
    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'UserId') return '42';
      return '';
    });

    mockSanitizer = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustResourceUrl']);
    mockSanitizer.bypassSecurityTrustResourceUrl.and.callFake((url: string) => url as any);

    mockCommonService = jasmine.createSpyObj('CommonService', ['convertS3File']);
    mockCommonService.convertS3File.and.returnValue('data:image/png;base64,...');

    await TestBed.configureTestingModule({
      imports: [CapitalExpenseComponent],
      providers: [
        { provide: CapitalExpenseService, useValue: mockService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: DatePipe, useValue: mockDatePipe },
        { provide: CookieService, useValue: mockCookieService },
        { provide: DomSanitizer, useValue: mockSanitizer },
        { provide: CommonService, useValue: mockCommonService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(CapitalExpenseComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(CapitalExpenseComponent);
    component = fixture.componentInstance;
  });

  it('should create the CapitalExpenseComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should read userId and initialize expenses', () => {
      spyOn(component, 'dateRangePicker').and.callFake(() => {});
      spyOn(component, 'getCaptialExpenses').and.callThrough();

      component.ngOnInit();

      expect(component.userID).toBe(42);
      expect(component.getCaptialExpenses).toHaveBeenCalled();
      expect(component.dateRangePicker).toHaveBeenCalled();
    });
  });

  describe('getCaptialExpenses', () => {
    it('should populate capitalExpenseList and clear skeleton', () => {
      component.startDate = '04-15-2026';
      component.endDate = '05-15-2026';
      component.getCaptialExpenses();

      expect(mockService.getAllExpensesListBasedOnType).toHaveBeenCalled();
      expect(component.capitalExpenseList.length).toBe(1);
      expect(component.skeletonShow).toBe('');
    });

    it('should handle error in getAllExpensesListBasedOnType', () => {
      mockService.getAllExpensesListBasedOnType.and.returnValue(throwError(() => new Error('Failed')));
      component.getCaptialExpenses();

      expect(component.capitalExpenseList).toEqual([]);
      expect(component.skeletonShow).toBe('NoRecord');
    });
  });

  describe('onSearchInput', () => {
    it('should debounce search and invoke getCaptialExpenses', fakeAsync(() => {
      const spy = spyOn(component, 'getCaptialExpenses').and.callFake(() => {});
      component.searchText = 'Laptop';
      component.onSearchInput();
      tick(500);

      expect(spy).toHaveBeenCalled();
    }));
  });

  describe('getMimeTypeFromExtension', () => {
    it('should return correct mime type for supported extensions', () => {
      expect(component.getMimeTypeFromExtension('pdf')).toBe('application/pdf');
      expect(component.getMimeTypeFromExtension('png')).toBe('image/png');
      expect(component.getMimeTypeFromExtension('jpg')).toBe('image/jpeg');
      expect(component.getMimeTypeFromExtension('unknown')).toBe('application/octet-stream');
    });
  });

  describe('Preview and Modal interactions', () => {
    it('should open and close preview modal', () => {
      component.openPreview('http://example.com/receipt.pdf');
      expect(component.isModalVisible).toBeTrue();
      expect(mockSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('http://example.com/receipt.pdf');

      component.closePreview();
      expect(component.isModalVisible).toBeFalse();
      expect(component.previewUrl).toBeNull();
    });

    it('should toggle modal in onclick', () => {
      component.onclick();
      expect(component.isModalVisible).toBeFalse();
    });
  });

  describe('downloadFile', () => {
    it('should open fileUrl in new window', () => {
      const spy = spyOn(window, 'open').and.callFake(() => null);
      component.downloadFile('http://example.com/file.pdf');
      expect(spy).toHaveBeenCalledWith('http://example.com/file.pdf', '_blank');
    });
  });
});
