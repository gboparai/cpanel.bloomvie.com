import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TransferStaffComponent } from './transfer-staff.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ManageStaffService } from '../add-staff/manage-staff.service';
import { ManageTeacherService } from '../../../teachers-management/manage-teacher/manage-teacher.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../../common-component/common.service';
import { CookieService } from 'ngx-cookie-service';
import { ApplicationServiceService } from '../../../application-status/application-service.service';
import { ProfileService } from '../../../common-component/profile/profile.service';
import { ElementRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

describe('TransferStaffComponent', () => {
  let component: TransferStaffComponent;
  let fixture: ComponentFixture<TransferStaffComponent>;
  let mockManageStaffService: jasmine.SpyObj<ManageStaffService>;
  let mockManageTeacherService: jasmine.SpyObj<ManageTeacherService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockCookie: jasmine.SpyObj<CookieService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAppService: jasmine.SpyObj<ApplicationServiceService>;
  let mockProfileService: jasmine.SpyObj<ProfileService>;

  beforeEach(async () => {
    mockManageStaffService = jasmine.createSpyObj('ManageStaffService', [
      'getRoleSpecializationList',
      'getStaffAccToNameAndEmailSearch',
      'getAllClassesByTeacherID',
      'getAllTeachersNameByCentreID',
      'getCentreStaffList',
      'checkClassAlreadyAssignOrNot',
    ]);
    mockManageTeacherService = jasmine.createSpyObj('ManageTeacherService', [
      'getStaffTransferedDetailsByCentreID',
    ]);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'warning', 'error', 'info']);
    mockCommonService = jasmine.createSpyObj('CommonService', [
      'decrypt',
      'manageEmployeeJourney',
      'sendEmailToParentAndStudent',
    ]);
    mockCookie = jasmine.createSpyObj('CookieService', ['get', 'set', 'check']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockAppService = jasmine.createSpyObj('ApplicationServiceService', ['getPrimaryDayCareList']);
    mockProfileService = jasmine.createSpyObj('ProfileService', ['GetUserById']);

    mockCookie.get.and.callFake((key: string) => {
      if (key === 'CentreID') return '10';
      if (key === 'UserId') return '5';
      return '';
    });
    mockCookie.check.and.returnValue(true);

    mockManageStaffService.getCentreStaffList.and.returnValue(of({
      message: 'Success',
      result: [{ id: 1, firstName: 'Alice', centreID: 10, userRoleID: 4, userRole: 'Teacher' }],
    }));
    mockAppService.getPrimaryDayCareList.and.returnValue(of({
      message: 'OK',
      result: [{ id: 2, centreName: 'North Daycare', centreAdminID: 99 }],
    }));

    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal'),
    });

    await TestBed.configureTestingModule({
      imports: [TransferStaffComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: ManageStaffService, useValue: mockManageStaffService },
        { provide: ManageTeacherService, useValue: mockManageTeacherService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: ToastrService, useValue: mockToastr },
        { provide: CommonService, useValue: mockCommonService },
        { provide: CookieService, useValue: mockCookie },
        { provide: Router, useValue: mockRouter },
        { provide: ApplicationServiceService, useValue: mockAppService },
        { provide: ProfileService, useValue: mockProfileService },
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
      .overrideComponent(TransferStaffComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(TransferStaffComponent);
    component = fixture.componentInstance;

    const dummyEl = document.createElement('input');
    component.datePickerInput = new ElementRef(dummyEl);
    component.datePickerInput1 = new ElementRef(dummyEl);
    const tabEl = document.createElement('button');
    component.transferTab = new ElementRef(tabEl);
    component.transferTab2 = new ElementRef(tabEl);
  });

  it('should create TransferStaffComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization and ngOnInit', () => {
    it('should initialize form controls', () => {
      expect(component.transferForm.contains('departmentID')).toBeTrue();
      expect(component.transferForm.contains('replaceCentreID')).toBeTrue();
      expect(component.transferForm.contains('actionDate')).toBeTrue();
      expect(component.transferForm.contains('roleSpecializationID')).toBeTrue();
    });

    it('should get centre ID from cookie and call getStaffList', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(mockManageStaffService.getCentreStaffList).toHaveBeenCalledWith(10, '', '', true);
      expect(component.staffList.length).toBe(1);
    }));
  });

  describe('Role and Daycare selection', () => {
    it('should fetch role specialization list on onChangeRole', () => {
      component.userRoleid = 4;
      mockManageStaffService.getRoleSpecializationList.and.returnValue(of({
        message: 'Success',
        result: [{ id: 1, name: 'Toddler Specialist' }],
      }));

      component.onChangeRole();

      expect(mockManageStaffService.getRoleSpecializationList).toHaveBeenCalledWith(4);
      expect(component.roleSpecializationList).toEqual([{ id: 1, name: 'Toddler Specialist' }]);
    });

    it('should set selectedRoleId on selectedRole', () => {
      component.selectedRole({ id: 5 });
      expect(component.selectedRoleId).toBe(5);
    });

    it('should fetch primary daycare list on getPrimaryDayCareList', () => {
      (component as any).centreID = 10;
      component.getPrimaryDayCareList();

      expect(mockAppService.getPrimaryDayCareList).toHaveBeenCalledWith(10, 'transferstaff');
      expect(component.primaryDayCarelist.length).toBe(1);
    });
  });

  describe('Search and Selection', () => {
    it('should search staff by name/email when length > 3', () => {
      (component as any).centreID = 10;
      component.StaffNameToSearch = 'Alice';
      mockManageStaffService.getStaffAccToNameAndEmailSearch.and.returnValue(of({
        message: 'Success',
        result: [{ id: 1, firstName: 'Alice' }],
      }));

      component.onSearchNameAndEmail();

      expect(mockManageStaffService.getStaffAccToNameAndEmailSearch).toHaveBeenCalledWith('Alice' as any, 10);
      expect(component.staffList).toEqual([{ id: 1, firstName: 'Alice' }]);
    });

    it('should call getStaffList if search query is empty', () => {
      component.StaffNameToSearch = '   ';
      spyOn(component, 'getStaffList');

      component.onSearchNameAndEmail();

      expect(component.getStaffList).toHaveBeenCalled();
    });
  });

  describe('Form submission and Dialogs', () => {
    it('should submit transfer form and show success toastr', () => {
      component.primaryDayCarelist = [{ centreAdminID: 77 }];
      component.selectDepartment = 1;
      component.selectDaycare = 20;
      component.selectDate = '2026-05-01';
      component.selectedRoleId = 3;

      mockCommonService.manageEmployeeJourney.and.returnValue(of({ message: 'OK' }));
      spyOn(component, 'getStaffList');

      component.submitForm();

      expect(mockCommonService.manageEmployeeJourney).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Staff transferred successfully!');
      expect(component.getStaffList).toHaveBeenCalled();
    });

    it('should handle error when manageEmployeeJourney fails', () => {
      component.primaryDayCarelist = [{ centreAdminID: 77 }];
      mockCommonService.manageEmployeeJourney.and.returnValue(throwError(() => new Error('Transfer failed')));

      component.submitForm();

      expect(mockToastr.error).toHaveBeenCalledWith('An error occurred while processing the request.', 'Error');
    });

    it('should close and reset modal form in onClose()', () => {
      spyOn(component.transferForm, 'reset');
      component.onClose();
      expect(component.transferForm.reset).toHaveBeenCalled();
    });

    it('should select item, store cookie, and navigate to staff-enrollment', () => {
      const mockItem = { id: 1, name: 'Alice' };
      spyOn(component.update, 'emit');

      component.selectItem(mockItem);

      expect(mockCookie.set).toHaveBeenCalledWith('staffData', JSON.stringify(mockItem));
      expect(component.update.emit).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/staff-enrollment']);
    });
  });
});
