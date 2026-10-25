import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LeaveManagementComponent } from './leave-management.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ManageMasterLeaveService } from '../../bloomvie-management/manage-master-leave/manage-master-leave.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { Renderer2, NO_ERRORS_SCHEMA } from '@angular/core';
import { OnboardingService } from '../../onboarding/onboarding.service';
import { CommonService } from '../../common-component/common.service';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

describe('LeaveManagementComponent', () => {
  let component: LeaveManagementComponent;
  let fixture: ComponentFixture<LeaveManagementComponent>;
  let mockLeaveService: jasmine.SpyObj<ManageMasterLeaveService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockCookie: jasmine.SpyObj<CookieService>;
  let mockOnboardingService: jasmine.SpyObj<OnboardingService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockRenderer: jasmine.SpyObj<Renderer2>;

  beforeEach(async () => {
    mockLeaveService = jasmine.createSpyObj('ManageMasterLeaveService', [
      'getAssignedLeavesByDaycareId',
      'getLeaveList',
      'activeInactiveDaycareLeaveAssignment',
      'upsertDaycareLeave',
    ]);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);
    mockCookie = jasmine.createSpyObj('CookieService', ['get', 'set', 'delete', 'check']);
    mockOnboardingService = jasmine.createSpyObj('OnboardingService', ['handleNext', 'getCurrentTab'], {
      onBoardingData: { isCompleteStep8: false }
    });
    mockCommonService = jasmine.createSpyObj('CommonService', ['decrypt', 'manageDaycareOnBoarding']);
    mockRenderer = jasmine.createSpyObj('Renderer2', ['addClass', 'removeClass']);

    mockLeaveService.getAssignedLeavesByDaycareId.and.returnValue(of({ result: [] }));
    mockLeaveService.getLeaveList.and.returnValue(of({ result: [] }));

    await TestBed.configureTestingModule({
      imports: [LeaveManagementComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: ManageMasterLeaveService, useValue: mockLeaveService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: ToastrService, useValue: mockToastr },
        { provide: CookieService, useValue: mockCookie },
        { provide: Renderer2, useValue: mockRenderer },
        { provide: OnboardingService, useValue: mockOnboardingService },
        { provide: CommonService, useValue: mockCommonService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: jasmine.createSpy('get').and.returnValue(null),
              },
            },
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(LeaveManagementComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(LeaveManagementComponent);
    component = fixture.componentInstance;
  });

  it('should create the LeaveManagementComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize daycareLeaveForm with default values and validation', () => {
      expect(component.daycareLeaveForm).toBeDefined();
      expect(component.daycareLeaveForm.get('id')?.value).toBe(0);
      expect(component.daycareLeaveForm.get('leaveType')?.value).toBe('');
      expect(component.daycareLeaveForm.get('description')?.value).toBe('');
      expect(component.daycareLeaveForm.get('leaveCount')?.value).toBeNull();
    });

    it('should validate invalid form controls', () => {
      component.daycareLeaveForm.patchValue({
        leaveType: '',
        description: '',
        leaveCount: null,
      });
      expect(component.daycareLeaveForm.valid).toBeFalse();

      component.daycareLeaveForm.patchValue({
        leaveType: 'Sick Leave',
        description: 'Valid description',
        leaveCount: 5,
      });
      expect(component.daycareLeaveForm.valid).toBeTrue();
    });
  });

  describe('ngOnInit', () => {
    it('should decrypt daycareCentreId from query param enc_id', () => {
      const route = TestBed.inject(ActivatedRoute);
      (route.snapshot.queryParamMap.get as jasmine.Spy).and.returnValue('enc123');
      mockCommonService.decrypt.and.returnValue('42');

      component.ngOnInit();

      expect(mockCommonService.decrypt).toHaveBeenCalledWith('enc123');
      expect(component.daycareCentreId).toBe(42);
      expect(mockLeaveService.getAssignedLeavesByDaycareId).toHaveBeenCalledWith(42);
    });

    it('should read daycareCentreId from cookie if no enc_id is present', () => {
      mockCookie.check.and.returnValue(true);
      mockCookie.get.and.returnValue('15');

      component.ngOnInit();

      expect(component.daycareCentreId).toBe(15);
      expect(mockLeaveService.getAssignedLeavesByDaycareId).toHaveBeenCalledWith(15);
    });
  });

  describe('onEdit', () => {
    it('should patch the form and set isEditing to true', () => {
      const mockItem = {
        id: 10,
        leaveType: 'Annual Leave',
        description: 'Annual vacation',
        leaveCount: 14,
      };

      component.onEdit(mockItem);

      expect(component.isEditing).toBeTrue();
      expect(component.daycareLeaveForm.value).toEqual({
        id: 10,
        leaveType: 'Annual Leave',
        description: 'Annual vacation',
        leaveCount: 14,
      });
    });
  });

  describe('toggleStatus', () => {
    it('should call activeInactiveDaycareLeaveAssignment when confirmed', async () => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      mockLeaveService.activeInactiveDaycareLeaveAssignment.and.returnValue(of({ message: 'Status updated' }));

      component.toggleStatus(5, true);
      await fixture.whenStable();

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(mockLeaveService.activeInactiveDaycareLeaveAssignment).toHaveBeenCalledWith(5);
      expect(mockToastr.success).toHaveBeenCalledWith('Status updated');
      expect(mockLeaveService.getAssignedLeavesByDaycareId).toHaveBeenCalled();
    });

    it('should handle error when toggle status fails', async () => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      mockLeaveService.activeInactiveDaycareLeaveAssignment.and.returnValue(throwError(() => ({ message: 'Update failed' })));

      component.toggleStatus(5, false);
      await fixture.whenStable();

      expect(mockToastr.error).toHaveBeenCalledWith('Update failed');
    });

    it('should revert isActive state when cancelled', async () => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: false } as any));
      component.assignedLeaveList = [
        { id: 7, daycareCentreId: 1, leaveTypeId: 2, leaveType: 'Sick', leaveCount: 5, isActive: true, description: 'Sick leave' },
      ];

      component.toggleStatus(7, true);
      await fixture.whenStable();

      expect(component.assignedLeaveList[0].isActive).toBeFalse();
    });
  });

  describe('getAssignedLeavesByDaycareId', () => {
    it('should populate assignedLeaveList and totalCount', () => {
      const mockLeaves = [
        { id: 1, daycareCentreId: 1, leaveTypeId: 1, leaveType: 'Casual', leaveCount: 3, isActive: true, description: '' },
      ];
      mockLeaveService.getAssignedLeavesByDaycareId.and.returnValue(of({ result: mockLeaves }));

      component.getAssignedLeavesByDaycareId();

      expect(component.assignedLeaveList).toEqual(mockLeaves);
      expect(component.totalCount).toBe(1);
    });

    it('should display error toastr on failure', () => {
      mockLeaveService.getAssignedLeavesByDaycareId.and.returnValue(throwError(() => ({ message: 'Fetch error' })));

      component.getAssignedLeavesByDaycareId();

      expect(mockToastr.error).toHaveBeenCalledWith('Fetch error');
    });
  });

  describe('getLeaveTypeList', () => {
    it('should fetch leaveTypeList with super-admin userType if UserRoleId is 1', () => {
      mockCookie.get.and.returnValue('1');
      mockLeaveService.getLeaveList.and.returnValue(of({
        result: [
          { id: 1, leaveType: 'Maternity', isActive: true },
          { id: 2, leaveType: 'Paternity', isActive: false },
        ]
      }));

      component.daycareCentreId = 5;
      component.getLeaveTypeList();

      expect(mockLeaveService.getLeaveList).toHaveBeenCalledWith(5, 'super-admin');
      expect(component.leaveTypeList.length).toBe(1);
      expect(component.leaveTypeList[0].leaveType).toBe('Maternity');
    });

    it('should display error toastr when getLeaveList fails', () => {
      mockCookie.get.and.returnValue('2');
      mockLeaveService.getLeaveList.and.returnValue(throwError(() => ({ message: 'Error leaves' })));

      component.getLeaveTypeList();

      expect(mockToastr.error).toHaveBeenCalledWith('Error leaves');
    });
  });

  describe('onSubmit', () => {
    it('should mark all touched and not submit when form is invalid', () => {
      component.daycareLeaveForm.patchValue({ leaveType: '' });

      component.onSubmit();

      expect(component.submitted).toBeFalse();
      expect(mockLeaveService.upsertDaycareLeave).not.toHaveBeenCalled();
    });

    it('should call upsertDaycareLeave on valid form submission', () => {
      component.daycareCentreId = 12;
      component.daycareLeaveForm.patchValue({
        id: 0,
        leaveType: 'Casual',
        description: 'Personal day',
        leaveCount: 2,
      });
      mockLeaveService.upsertDaycareLeave.and.returnValue(of({ message: 'Leave saved' }));

      component.onSubmit();

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(mockLeaveService.upsertDaycareLeave).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Leave saved');
      expect(component.isEditing).toBeFalse();
    });

    it('should handle error when upsertDaycareLeave fails', () => {
      component.daycareLeaveForm.patchValue({
        id: 1,
        leaveType: 'Casual',
        description: 'Personal day',
        leaveCount: 2,
      });
      mockLeaveService.upsertDaycareLeave.and.returnValue(throwError(() => ({ message: 'Save error' })));

      component.onSubmit();

      expect(mockToastr.error).toHaveBeenCalledWith('Save error');
    });
  });

  describe('reset and getters', () => {
    it('should reset isEditing on reset()', () => {
      component.isEditing = true;
      component.reset();
      expect(component.isEditing).toBeFalse();
    });

    it('should return isValid based on assignedLeaveList length', () => {
      component.assignedLeaveList = [];
      expect(component.isValid).toBeFalse();

      component.assignedLeaveList = [{ id: 1 } as any];
      expect(component.isValid).toBeTrue();
    });
  });

  describe('proceedToOnboarding', () => {
    it('should handle next step when step 8 is incomplete', () => {
      mockCommonService.manageDaycareOnBoarding.and.returnValue(of({ message: 'Success' }));
      component.daycareCentreId = 3;
      component.onBoardingService.onBoardingData.isCompleteStep8 = false;

      component.proceedToOnboarding();

      expect(mockCommonService.manageDaycareOnBoarding).toHaveBeenCalledWith(3, 'ManageDaycareLeaveAssignment');
      expect(component.onBoardingService.onBoardingData.isCompleteStep8).toBeTrue();
      expect(mockOnboardingService.handleNext).toHaveBeenCalledWith('Tab-8');
    });

    it('should call getCurrentTab when step 8 was already complete', () => {
      mockCommonService.manageDaycareOnBoarding.and.returnValue(of({ message: 'Success' }));
      component.onBoardingService.onBoardingData.isCompleteStep8 = true;

      component.proceedToOnboarding();

      expect(mockOnboardingService.getCurrentTab).toHaveBeenCalled();
    });
  });
});
