import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ViewStaffComponent } from './view-staff.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ManageStaffService } from '../add-staff/manage-staff.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../../common-component/common.service';
import { CookieService } from 'ngx-cookie-service';
import { ManageClassroomService } from '../../classroom-management/manage-classroom/manage-classroom.service';
import { OnboardingService } from '../../../onboarding/onboarding.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

describe('ViewStaffComponent', () => {
  let component: ViewStaffComponent;
  let fixture: ComponentFixture<ViewStaffComponent>;
  let mockManageStaffService: jasmine.SpyObj<ManageStaffService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockCookie: jasmine.SpyObj<CookieService>;
  let mockClassService: jasmine.SpyObj<ManageClassroomService>;
  let mockOnboardingService: any;

  beforeEach(async () => {
    mockManageStaffService = jasmine.createSpyObj('ManageStaffService', [
      'getCounsellorList',
      'getDaycareClasses',
      'activeInactiveStaff',
      'getCentreStaffList',
      'getAllClassesByTeacherID',
      'getClassroomByID',
      'getAllTeachersNameByCentreID',
      'getDayCareListByCentreAdminID',
      'getClassTimingsByID',
      'checkClassAlreadyAssignOrNot',
    ]);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'warning', 'error', 'info']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['decrypt', 'trigger', 'sendEmailToParentAndStudent']);
    mockCookie = jasmine.createSpyObj('CookieService', ['get', 'set', 'check']);
    mockClassService = jasmine.createSpyObj('ManageClassroomService', ['getClassSection']);

    mockCookie.get.and.callFake((key: string) => {
      if (key === 'CentreID') return '10';
      if (key === 'UserId') return '25';
      if (key === 'UserRoleId') return '3';
      return '';
    });
    mockCookie.check.and.returnValue(true);

    mockManageStaffService.getCentreStaffList.and.returnValue(of({
      message: 'Success',
      result: [
        { id: 1, firstName: 'Alice', userRoleID: 4, isActive: true },
        { id: 2, firstName: 'Bob', userRoleID: 9, isActive: false },
      ],
    }));

    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal'),
    });

    mockOnboardingService = {
      isOnboarding: false,
    };

    await TestBed.configureTestingModule({
      imports: [ViewStaffComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: ManageStaffService, useValue: mockManageStaffService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: ToastrService, useValue: mockToastr },
        { provide: Router, useValue: mockRouter },
        { provide: CommonService, useValue: mockCommonService },
        { provide: CookieService, useValue: mockCookie },
        { provide: ManageClassroomService, useValue: mockClassService },
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
      .overrideComponent(ViewStaffComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ViewStaffComponent);
    component = fixture.componentInstance;
  });

  it('should create ViewStaffComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit and Search', () => {
    it('should initialize centreID, userRoleID, and load staff list', fakeAsync(() => {
      component.ngOnInit();
      tick(1050);

      expect(mockManageStaffService.getCentreStaffList).toHaveBeenCalledWith(10, '', 'active', false);
      expect(component.staffList.length).toBe(2);
    }));

    it('should filter staff list when searchTerm changes', fakeAsync(() => {
      component.ngOnInit();
      component.searchTerm.setValue('Alice');
      tick(1050);

      expect(mockManageStaffService.getCentreStaffList).toHaveBeenCalledWith(10, 'Alice', 'active', false);
    }));

    it('should close banner on closeBanner()', () => {
      expect(component.showBanner).toBeTrue();
      component.closeBanner();
      expect(component.showBanner).toBeFalse();
    });

    it('should toggle collapse item', () => {
      expect(component.openedItemId).toBeNull();
      component.toggleCollapse(5);
      expect(component.openedItemId).toBe(5);
      component.toggleCollapse(5);
      expect(component.openedItemId).toBeNull();
    });
  });

  describe('Status filter and Modals', () => {
    it('should update filter type on filterActiveDeactive', () => {
      component.filterActiveDeactive('inactive');
      expect(component.types).toBe('inactive');
      expect(mockManageStaffService.getCentreStaffList).toHaveBeenCalledWith(10, '', 'inactive', false);
    });

    it('should toggle staff status with Swal confirmation', async () => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      mockManageStaffService.activeInactiveStaff.and.returnValue(of({ message: 'Success' }));

      component.displayModalsAccToCondition(1, true);
      await fixture.whenStable();

      expect(mockManageStaffService.activeInactiveStaff).toHaveBeenCalledWith(1);
      expect(mockCommonService.trigger).toHaveBeenCalled();
    });
  });

  describe('Classroom and Details', () => {
    it('should fetch daycare classes on getDaycareClassList', () => {
      mockManageStaffService.getDaycareClasses.and.returnValue(of({
        message: 'Success',
        result: [{ id: 10, name: 'Infant Room' }],
      }));

      component.getDaycareClassList();

      expect(mockManageStaffService.getDaycareClasses).toHaveBeenCalled();
      expect(component.classList).toEqual([{ id: 10, name: 'Infant Room' }]);
    });

    it('should fetch counsellor list on getCounsellorList', () => {
      mockManageStaffService.getCounsellorList.and.returnValue(of({
        message: 'Success',
        result: [{ id: 1, name: 'Counsellor A' }],
      }));

      component.getCounsellorList(5);

      expect(mockManageStaffService.getCounsellorList).toHaveBeenCalledWith(5);
      expect(component.counsellorList).toEqual([{ id: 1, name: 'Counsellor A' }]);
    });

    it('should find teacher detail on viewTeacherDetail', () => {
      component.staffList = [
        { id: 1, firstName: 'Alice' },
        { id: 2, firstName: 'Bob' },
      ];

      component.viewTeacherDetail(1);

      expect(component.teacherViewDetail).toEqual({ id: 1, firstName: 'Alice' });
    });

    it('should return day name string from getDayNames(index)', () => {
      expect(component.getDayNames(0)).toBe('Monday');
      expect(component.getDayNames(4)).toBe('Friday');
    });

    it('should select item, store cookie, and navigate to staff-enrollment', () => {
      const mockStaff = { id: 10, firstName: 'Jane' };
      spyOn(component.update, 'emit');

      component.selectItem(mockStaff);

      expect(mockCookie.set).toHaveBeenCalled();
      expect(component.update.emit).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/staff-enrollment']);
    });
  });
});
