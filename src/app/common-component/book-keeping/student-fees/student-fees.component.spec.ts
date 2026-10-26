import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { StudentFeesComponent } from './student-fees.component';
import { StudentServiceService } from './student-service.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { CookieService } from 'ngx-cookie-service';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ManageStudentService } from '../../../day-care-management/student-management/manage-student/manage-student.service';
import { BookKeepingService } from '../book-keeping.service';
import { ParentDashboardService } from '../../../parent-management/parent-dashboard/parent-dashboard.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

describe('StudentFeesComponent', () => {
  let component: StudentFeesComponent;
  let fixture: ComponentFixture<StudentFeesComponent>;

  let mockStudentFeeService: jasmine.SpyObj<StudentServiceService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockDatePipe: jasmine.SpyObj<DatePipe>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockManageStudentService: jasmine.SpyObj<ManageStudentService>;
  let mockBookKeepingService: jasmine.SpyObj<BookKeepingService>;
  let mockParentDashboardService: jasmine.SpyObj<ParentDashboardService>;

  beforeEach(async () => {
    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal'),
      val: jasmine.createSpy('val')
    });

    mockStudentFeeService = jasmine.createSpyObj('StudentServiceService', [
      'getStudentsTransactionDetailsByCentreAdminID',
      'sendActions',
      'getAllStudentPendingPaymentRecordByDaycareAdminID'
    ]);
    mockStudentFeeService.getStudentsTransactionDetailsByCentreAdminID.and.returnValue(of({
      message: 'OK',
      result: [
        {
          studentFeeID: 10,
          studentName: 'Tommy',
          paidAmount: 250,
          paymentStatus: 'Paid'
        }
      ]
    }));
    mockStudentFeeService.sendActions.and.returnValue(of({ message: 'Success' }));
    mockStudentFeeService.getAllStudentPendingPaymentRecordByDaycareAdminID.and.returnValue(of({
      message: 'OK',
      result: [{ studentID: 1, pendingAmount: 100 }]
    }));

    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);

    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'set', 'delete', 'check']);
    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'CentreID') return '15';
      if (key === 'UserId') return '33';
      if (key === 'UserRoleId') return '3';
      return '';
    });

    mockDatePipe = jasmine.createSpyObj('DatePipe', ['transform']);
    mockDatePipe.transform.and.returnValue('2026-05-15');

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockManageStudentService = jasmine.createSpyObj('ManageStudentService', ['getStudentList']);

    mockBookKeepingService = jasmine.createSpyObj('BookKeepingService', ['getInvoice']);
    mockBookKeepingService.getInvoice.and.returnValue(of({ message: 'OK', result: 'base64Invoice' }));

    mockParentDashboardService = jasmine.createSpyObj('ParentDashboardService', [
      'ClearStudentPendingPayments',
      'getAllPendingPaymentsByStudentID'
    ]);
    mockParentDashboardService.ClearStudentPendingPayments.and.returnValue(of({ message: 'Success' }));
    mockParentDashboardService.getAllPendingPaymentsByStudentID.and.returnValue(of({
      message: 'Success',
      result: [{ studentFeeID: 1, pendingAmount: 50 }]
    }));

    await TestBed.configureTestingModule({
      imports: [StudentFeesComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: StudentServiceService, useValue: mockStudentFeeService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: CookieService, useValue: mockCookieService },
        { provide: DatePipe, useValue: mockDatePipe },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({}),
            snapshot: { queryParamMap: { get: () => null } }
          }
        },
        { provide: ManageStudentService, useValue: mockManageStudentService },
        { provide: BookKeepingService, useValue: mockBookKeepingService },
        { provide: ParentDashboardService, useValue: mockParentDashboardService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(StudentFeesComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentFeesComponent);
    component = fixture.componentInstance;
  });

  it('should create the StudentFeesComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize cookie properties and call getAllStudentFeesDetails', () => {
      spyOn(component, 'getAllStudentFeesDetails').and.callThrough();
      spyOn(component, 'patchDates').and.callFake(() => {});

      component.ngOnInit();

      expect(component.centreID).toBe(15);
      expect(component.UserID).toBe(33);
      expect(component.UserRoleID).toBe(3);
      expect(component.getAllStudentFeesDetails).toHaveBeenCalledWith('All', false);
    });
  });

  describe('getAllStudentFeesDetails', () => {
    it('should fetch fee records and update activeTab and skeleton', () => {
      component.centreID = 15;
      component.getAllStudentFeesDetails('Paid', false);

      expect(mockStudentFeeService.getStudentsTransactionDetailsByCentreAdminID).toHaveBeenCalled();
      expect(component.studentFeeRecords.length).toBe(1);
      expect(component.activeTab).toBe('Paid');
      expect(component.skeletonShow).toBe('');
    });
  });

  describe('onSearchInput', () => {
    it('should debounce search and trigger getAllStudentFeesDetails', fakeAsync(() => {
      const spy = spyOn(component, 'getAllStudentFeesDetails').and.callFake(() => {});
      component.searchText = 'Tommy';
      component.onSearchInput();
      tick(500);

      expect(spy).toHaveBeenCalled();
    }));
  });

  describe('sendActions', () => {
    it('should send required actions on fee record', () => {
      component.sendActions('Reminder', { planID: 5, senderID: 10, studentID: 2 });
      expect(mockStudentFeeService.sendActions).toHaveBeenCalledWith('Reminder', 5, 10, 2);
    });
  });

  describe('downloadInvoice', () => {
    it('should call bookKeepingService to retrieve invoice', () => {
      component.downloadInvoice('INV-999');
      expect(mockBookKeepingService.getInvoice).toHaveBeenCalledWith('INV-999');
    });
  });

  describe('getAllStudentPendingPaymentRecordByDaycareAdminID', () => {
    it('should fetch pending student payment records', () => {
      component.centreID = 15;
      component.getAllStudentPendingPaymentRecordByDaycareAdminID();

      expect(mockStudentFeeService.getAllStudentPendingPaymentRecordByDaycareAdminID).toHaveBeenCalledWith(15);
      expect(component.StudentPendingPaymentRecord.length).toBe(1);
    });
  });
});
