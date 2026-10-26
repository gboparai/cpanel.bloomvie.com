import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PayrollExpenseComponent } from './payroll-expense.component';
import { AttendanceDashboardService } from '../../attendance-dashboard/attendance-dashboard.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
import { ManageStaffService } from '../../../day-care-management/staff-management/add-staff/manage-staff.service';
import { CookieService } from 'ngx-cookie-service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { LoginService } from '../../../login/login.service';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonService } from '../../common.service';
import { StripeService } from 'ngx-stripe';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

describe('PayrollExpenseComponent', () => {
  let component: PayrollExpenseComponent;
  let fixture: ComponentFixture<PayrollExpenseComponent>;

  let mockAttendanceService: jasmine.SpyObj<AttendanceDashboardService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockDatePipe: jasmine.SpyObj<DatePipe>;
  let mockManageStaffService: jasmine.SpyObj<ManageStaffService>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockLoginService: any;
  let mockSanitizer: jasmine.SpyObj<DomSanitizer>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockStripeService: jasmine.SpyObj<StripeService>;

  beforeEach(async () => {
    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal'),
      val: jasmine.createSpy('val'),
      text: jasmine.createSpy('text')
    });

    mockAttendanceService = jasmine.createSpyObj('AttendanceDashboardService', [
      'getDayCareByID',
      'getEmployeeAllDetails'
    ]);
    mockAttendanceService.getDayCareByID.and.returnValue(of({
      message: 'Success',
      result: { centreName: 'Sunshine Daycare' }
    }));
    mockAttendanceService.getEmployeeAllDetails.and.returnValue(of({
      message: 'OK',
      result: [
        {
          teacherID: 1,
          fullName: 'John Smith',
          employeeSalary: 3000,
          salaryDate: '2026-05-01',
          employeeProfileUrl: 'profile.jpg',
          salaryDetails: [
            { salarySlip: 'slip_base64' }
          ]
        }
      ]
    }));

    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);

    mockDatePipe = jasmine.createSpyObj('DatePipe', ['transform']);
    mockDatePipe.transform.and.returnValue('2026-05-15');

    mockManageStaffService = jasmine.createSpyObj('ManageStaffService', ['getClassListByuserRoleID']);

    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'set', 'delete', 'check']);
    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'CentreID') return '10';
      if (key === 'UserRoleId') return '3';
      if (key === 'UserId') return '77';
      return '';
    });

    mockLoginService = {
      authData: { userId: 77 }
    };

    mockSanitizer = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustResourceUrl']);
    mockSanitizer.bypassSecurityTrustResourceUrl.and.callFake((url: string) => url as any);

    mockCommonService = jasmine.createSpyObj('CommonService', [
      'platFormFee',
      'createPaymentIntent',
      'convertS3File',
      'base64ToBlobUrl'
    ]);
    mockCommonService.platFormFee.and.returnValue(2.9);
    mockCommonService.createPaymentIntent.and.returnValue(of({ message: 'OK', clientSecret: 'pi_secret_123' }));
    mockCommonService.convertS3File.and.returnValue('data:image/png...');
    mockCommonService.base64ToBlobUrl.and.returnValue('blob:http://localhost/salary');

    mockStripeService = jasmine.createSpyObj('StripeService', ['confirmCardPayment']);

    await TestBed.configureTestingModule({
      imports: [PayrollExpenseComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: AttendanceDashboardService, useValue: mockAttendanceService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: DatePipe, useValue: mockDatePipe },
        { provide: ManageStaffService, useValue: mockManageStaffService },
        { provide: CookieService, useValue: mockCookieService },
        { provide: LoginService, useValue: mockLoginService },
        { provide: DomSanitizer, useValue: mockSanitizer },
        { provide: CommonService, useValue: mockCommonService },
        { provide: StripeService, useValue: mockStripeService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(PayrollExpenseComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayrollExpenseComponent);
    component = fixture.componentInstance;
  });

  it('should create the PayrollExpenseComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize properties and call getDayCareByID', () => {
      spyOn(component, 'getAllEmployeeSalary').and.callFake(() => {});

      component.ngOnInit();

      expect(component.centreID).toBe('10');
      expect(component.userRoleID).toBe('3');
      expect(component.loginUserId).toBe(77);
      expect(mockAttendanceService.getDayCareByID).toHaveBeenCalledWith('10');
    });
  });

  describe('getAllEmployeeSalary', () => {
    it('should fetch employee salary list and clear skeleton', () => {
      component.centreID = '10';
      component.userRoleID = '3';
      component.getAllEmployeeSalary();

      expect(mockAttendanceService.getEmployeeAllDetails).toHaveBeenCalled();
      expect(component.employeSalaryList.length).toBe(1);
      expect(component.skeletonShow).toBe('');
    });
  });

  describe('onPageChange', () => {
    it('should update ContentP', () => {
      component.onPageChange(2);
      expect(component.ContentP).toBe(2);
    });
  });

  describe('Preview controls', () => {
    it('should open preview with url and type', () => {
      component.openPreview('http://example.com/slip.pdf', 'pdf');
      expect(component.previewUrl).toBe('http://example.com/slip.pdf');
      expect(component.previewType).toBe('pdf');
    });

    it('should close preview', () => {
      component.openPreview('http://example.com/slip.pdf', 'pdf');
      component.closePreview();
      expect(component.previewUrl).toBeNull();
      expect(component.previewType).toBeNull();
    });
  });

  describe('ResetForm', () => {
    it('should reset pay form and form controls', () => {
      component.ResetForm();
      expect(component.paySalaryForm.pristine).toBeTrue();
      expect(component.paySalaryForm.untouched).toBeTrue();
    });
  });
});
