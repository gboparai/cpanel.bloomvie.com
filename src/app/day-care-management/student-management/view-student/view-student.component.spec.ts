import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ViewStudentComponent } from './view-student.component';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '../../../common-component/common.service';
import { ManageStudentService } from '../manage-student/manage-student.service';
import { ManageStaffService } from '../../staff-management/add-staff/manage-staff.service';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { OnboardingService } from '../../../onboarding/onboarding.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

describe('ViewStudentComponent', () => {
  let component: ViewStudentComponent;
  let fixture: ComponentFixture<ViewStudentComponent>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockManageStudentService: jasmine.SpyObj<ManageStudentService>;
  let mockManageStaffService: jasmine.SpyObj<ManageStaffService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockCookie: jasmine.SpyObj<CookieService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockOnboardingService: any;

  beforeEach(async () => {
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['decrypt']);
    mockManageStudentService = jasmine.createSpyObj('ManageStudentService', [
      'getDaycareStudentList',
      'sendMailToParentAndTeacherForPassword',
      'activeInactiveEnrolledStudent',
    ]);
    mockManageStaffService = jasmine.createSpyObj('ManageStaffService', [
      'getClassListByuserRoleID',
    ]);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'warning', 'error', 'info']);
    mockCookie = jasmine.createSpyObj('CookieService', ['get', 'set', 'check']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockCookie.get.and.callFake((key: string) => {
      if (key === 'CentreID') return '10';
      if (key === 'UserId') return '5';
      if (key === 'UserRoleId') return '3';
      return '';
    });
    mockCookie.check.and.returnValue(true);

    mockManageStudentService.getDaycareStudentList.and.returnValue(of({
      message: 'Success',
      result: [
        { id: 1, minAge: 12, maxAge: 24, isMonthly: true, firstName: 'Emma' },
        { id: 2, minAge: 2, maxAge: 4, isMonthly: false, firstName: 'Liam' },
      ],
    }));
    mockManageStaffService.getClassListByuserRoleID.and.returnValue(of({
      message: 'Success',
      result: [{ classID: 10, className: 'Infant Room' }],
    }));

    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal'),
    });

    mockOnboardingService = {
      isOnboarding: false,
    };

    await TestBed.configureTestingModule({
      imports: [ViewStudentComponent],
      providers: [
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: CommonService, useValue: mockCommonService },
        { provide: ManageStudentService, useValue: mockManageStudentService },
        { provide: ManageStaffService, useValue: mockManageStaffService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: CookieService, useValue: mockCookie },
        { provide: Router, useValue: mockRouter },
        { provide: OnboardingService, useValue: mockOnboardingService },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of({
              get: (k: string) => (k === 'enc_id' ? null : null),
            }),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ViewStudentComponent, {
        set: {
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ViewStudentComponent);
    component = fixture.componentInstance;
  });

  it('should create ViewStudentComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit and Retrieval', () => {
    it('should initialize centreID, userRoleId, and load student & class lists', fakeAsync(() => {
      component.ngOnInit();
      tick(350);

      expect(mockManageStudentService.getDaycareStudentList).toHaveBeenCalledWith(10, '', 3, 5, 0, 'active');
      expect(component.studentList.length).toBe(2);
      expect(mockManageStaffService.getClassListByuserRoleID).toHaveBeenCalledWith(5, 10, 3);
      expect(component.AllClassList).toEqual([{ classID: 10, className: 'Infant Room' }]);
    }));
  });

  describe('Banner and Filter operations', () => {
    it('should close banner on closeBanner()', () => {
      expect(component.showBanner).toBeTrue();
      component.closeBanner();
      expect(component.showBanner).toBeFalse();
    });

    it('should filter by class on selectedClass()', () => {
      component.selectedClass({ classID: 10 });
      expect(component.selectedClassId).toBe(10);
      expect(mockManageStudentService.getDaycareStudentList).toHaveBeenCalled();

      component.selectedClass(null);
      expect(component.selectedClassId).toBe(0);
    });

    it('should filter active/deactive status in filterActiveDeactive()', () => {
      component.filterActiveDeactive('inactive');
      expect(component.types).toBe('inactive');
      expect(mockManageStudentService.getDaycareStudentList).toHaveBeenCalled();
    });
  });

  describe('Age Calculations', () => {
    it('should convert months to years accurately', () => {
      expect(component.convertMonthsToYears(24)).toBe(2);
      expect(component.convertMonthsToYears(35)).toBe(2);
    });

    it('should throw error if negative months passed', () => {
      expect(() => component.convertMonthsToYears(-5)).toThrowError();
    });

    it('should convert years to months accurately', () => {
      expect(component.convertYearsToMonths(3)).toBe(36);
    });

    it('should throw error if negative years passed', () => {
      expect(() => component.convertYearsToMonths(-2)).toThrowError();
    });
  });

  describe('Active/Inactive toggle and Actions', () => {
    it('should toggle student status with Swal confirmation', async () => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      mockManageStudentService.activeInactiveEnrolledStudent.and.returnValue(of({ message: 'Success' }));
      const event = { target: { checked: false } };

      component.activeInactive(15, event);
      await fixture.whenStable();

      expect(mockManageStudentService.activeInactiveEnrolledStudent).toHaveBeenCalledWith(15);
      expect(mockManageStudentService.getDaycareStudentList).toHaveBeenCalled();
    });

    it('should send email to parent and teacher for password', () => {
      mockManageStudentService.sendMailToParentAndTeacherForPassword.and.returnValue(of({
        message: 'OK',
        activity: 'Email sent successfully',
      }));

      component.sendMailToParentAndTeacherForPassword({ id: 5 });

      expect(mockManageStudentService.sendMailToParentAndTeacherForPassword).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Email sent successfully');
    });

    it('should open modal and emit parentList in onOpenModal()', () => {
      spyOn(component.parentList, 'emit');
      component.onOpenModal({ parentInformation: [{ id: 1, name: 'Parent 1' }] });

      expect(component.parentList.emit).toHaveBeenCalledWith([{ id: 1, name: 'Parent 1' }]);
    });
  });
});
