import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { OperatingExpenseComponent } from './operating-expense.component';
import { CapitalExpenseService } from '../capital-expense/capital-expense.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { CommonService } from '../../common.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

describe('OperatingExpenseComponent', () => {
  let component: OperatingExpenseComponent;
  let fixture: ComponentFixture<OperatingExpenseComponent>;

  let mockCapitalExpenseService: jasmine.SpyObj<CapitalExpenseService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockDatePipe: jasmine.SpyObj<DatePipe>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;

  beforeEach(async () => {
    mockCapitalExpenseService = jasmine.createSpyObj('CapitalExpenseService', [
      'getAllExpensesListBasedOnType'
    ]);
    mockCapitalExpenseService.getAllExpensesListBasedOnType.and.returnValue(of({
      message: 'Success',
      result: [
        {
          id: 1,
          expenseName: 'Utilities',
          amount: 800,
          receiptImage: 'util.pdf'
        }
      ]
    }));

    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);

    mockDatePipe = jasmine.createSpyObj('DatePipe', ['transform']);
    mockDatePipe.transform.and.returnValue('2026-05-15');

    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'set', 'delete', 'check']);
    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'UserId') return '55';
      return '';
    });

    mockCommonService = jasmine.createSpyObj('CommonService', ['ConvertS3File']);

    await TestBed.configureTestingModule({
      imports: [OperatingExpenseComponent],
      providers: [
        { provide: CapitalExpenseService, useValue: mockCapitalExpenseService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: DatePipe, useValue: mockDatePipe },
        { provide: CookieService, useValue: mockCookieService },
        { provide: CommonService, useValue: mockCommonService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(OperatingExpenseComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(OperatingExpenseComponent);
    component = fixture.componentInstance;
  });

  it('should create the OperatingExpenseComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should read userId and load operating expenses', () => {
      spyOn(component, 'dateRangePicker').and.callFake(() => {});
      spyOn(component, 'getOperatingExpensesList').and.callThrough();

      component.ngOnInit();

      expect(component.userID).toBe(55);
      expect(component.getOperatingExpensesList).toHaveBeenCalled();
      expect(component.dateRangePicker).toHaveBeenCalled();
    });
  });

  describe('getOperatingExpensesList', () => {
    it('should populate operatingExpenseList on success and clear skeleton', () => {
      component.startDate = '04-15-2026';
      component.endDate = '05-15-2026';
      component.getOperatingExpensesList();

      expect(mockCapitalExpenseService.getAllExpensesListBasedOnType).toHaveBeenCalled();
      expect(component.operatingExpenseList.length).toBe(1);
      expect(component.skeletonShow).toBe('');
    });

    it('should handle error when getAllExpensesListBasedOnType fails', () => {
      mockCapitalExpenseService.getAllExpensesListBasedOnType.and.returnValue(throwError(() => new Error('Error')));
      component.getOperatingExpensesList();

      expect(component.operatingExpenseList).toEqual([]);
      expect(component.skeletonShow).toBe('NoRecord');
    });
  });

  describe('onSearchInput', () => {
    it('should debounce input and call getOperatingExpensesList', fakeAsync(() => {
      const spy = spyOn(component, 'getOperatingExpensesList').and.callFake(() => {});
      component.searchText = 'Office';
      component.onSearchInput();
      tick(500);

      expect(spy).toHaveBeenCalled();
    }));
  });

  describe('downloadReceipt', () => {
    it('should open window with receipt URL', () => {
      const spy = spyOn(window, 'open').and.callFake(() => null);
      component.downloadReceipt({ receiptImage: 'receipt123.pdf' });
      expect(spy).toHaveBeenCalled();
    });
  });
});
