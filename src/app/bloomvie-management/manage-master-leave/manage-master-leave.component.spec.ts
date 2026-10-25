import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Renderer2 } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ManageMasterLeaveComponent } from './manage-master-leave.component';
import { ManageMasterLeaveService } from './manage-master-leave.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../common-component/common.service';
import { OnboardingService } from '../../onboarding/onboarding.service';
import { CookieService } from 'ngx-cookie-service';
import Swal from 'sweetalert2';

describe('ManageMasterLeaveComponent', () => {
  let component: ManageMasterLeaveComponent;
  let fixture: ComponentFixture<ManageMasterLeaveComponent>;

  let leaveTypeServiceSpy: jasmine.SpyObj<ManageMasterLeaveService>;
  let spinnerSpy: jasmine.SpyObj<NgxSpinnerService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;
  let commonServiceSpy: jasmine.SpyObj<CommonService>;
  let onboardingServiceSpy: jasmine.SpyObj<OnboardingService>;
  let cookieServiceSpy: jasmine.SpyObj<CookieService>;

  beforeEach(async () => {
    leaveTypeServiceSpy = jasmine.createSpyObj('ManageMasterLeaveService', [
      'getLeaveList',
      'manageLeave',
      'activeInactive',
    ]);
    spinnerSpy = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);
    commonServiceSpy = jasmine.createSpyObj('CommonService', ['decrypt']);
    onboardingServiceSpy = jasmine.createSpyObj('OnboardingService', ['getOnboardingStatus']);
    cookieServiceSpy = jasmine.createSpyObj('CookieService', ['get', 'check']);

    commonServiceSpy.decrypt.and.callFake((val: string) => (val === 'enc_10' ? '10' : ''));

    cookieServiceSpy.check.and.callFake((key: string) => {
      if (key === 'CentreID') return true;
      if (key === 'UserId') return true;
      return false;
    });

    cookieServiceSpy.get.and.callFake((key: string) => {
      if (key === 'CentreID') return '10';
      if (key === 'UserId') return '50';
      if (key === 'UserRoleId') return '1';
      return '';
    });

    leaveTypeServiceSpy.getLeaveList.and.returnValue(
      of({
        result: [
          { id: 1, leaveType: 'Sick Leave', isActive: true },
          { id: 2, leaveType: 'Casual Leave', isActive: false },
        ],
      })
    );

    await TestBed.configureTestingModule({
      imports: [ManageMasterLeaveComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        Renderer2,
        { provide: ManageMasterLeaveService, useValue: leaveTypeServiceSpy },
        { provide: NgxSpinnerService, useValue: spinnerSpy },
        { provide: ToastrService, useValue: toastrSpy },
        { provide: CommonService, useValue: commonServiceSpy },
        { provide: OnboardingService, useValue: onboardingServiceSpy },
        { provide: CookieService, useValue: cookieServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => (key === 'enc_id' ? 'enc_10' : null),
              },
            },
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageMasterLeaveComponent);
    component = fixture.componentInstance;
  });

  it('should create the component and initialize leaveForm', () => {
    expect(component).toBeTruthy();
    expect(component.leaveForm).toBeDefined();
    expect(component.leaveForm.controls['leaveType']).toBeDefined();
  });

  describe('ngOnInit', () => {
    it('should decrypt enc_id from route and load leave list', () => {
      component.ngOnInit();

      expect(commonServiceSpy.decrypt).toHaveBeenCalledWith('enc_10');
      expect(component.daycareCentreId).toBe(10);
      expect(component.loginUserId).toBe(50);
      expect(leaveTypeServiceSpy.getLeaveList).toHaveBeenCalledWith(10, 'super-admin');
      expect(component.leaveTypeList.length).toBe(2);
      expect(component.isValid).toBe(true);
    });

    it('should read CentreID from cookies when enc_id query param is absent', () => {
      const route = TestBed.inject(ActivatedRoute);
      spyOn(route.snapshot.queryParamMap, 'get').and.returnValue(null);

      component.ngOnInit();

      expect(component.daycareCentreId).toBe(10);
      expect(leaveTypeServiceSpy.getLeaveList).toHaveBeenCalled();
    });

    it('should use daycare-admin role when UserRoleId is not 1', () => {
      cookieServiceSpy.get.and.callFake((key: string) => {
        if (key === 'CentreID') return '15';
        if (key === 'UserId') return '60';
        if (key === 'UserRoleId') return '2';
        return '';
      });

      component.getLeaveList();

      expect(leaveTypeServiceSpy.getLeaveList).toHaveBeenCalledWith(component.daycareCentreId, 'daycare-admin');
    });

    it('should handle error when getLeaveList fails', () => {
      leaveTypeServiceSpy.getLeaveList.and.returnValue(
        throwError(() => new Error('Could not fetch leaves'))
      );

      component.getLeaveList();

      expect(toastrSpy.error).toHaveBeenCalledWith('Could not fetch leaves');
    });
  });

  describe('onSubmit', () => {
    it('should return without saving if leaveForm is invalid', () => {
      component.leaveForm.patchValue({ leaveType: '' });

      component.onSubmit();

      expect(component.submitted).toBe(true);
      expect(leaveTypeServiceSpy.manageLeave).not.toHaveBeenCalled();
    });

    it('should submit successfully when form is valid (role 1)', () => {
      component.daycareCentreId = 10;
      component.loginUserId = 50;
      component.leaveForm.patchValue({ id: 0, leaveType: 'Maternity Leave' });

      leaveTypeServiceSpy.manageLeave.and.returnValue(
        of({ message: 'Leave created successfully' })
      );
      spyOn(component.leaveTypeRefresh, 'emit');

      component.onSubmit();

      expect(spinnerSpy.show).toHaveBeenCalled();
      expect(leaveTypeServiceSpy.manageLeave).toHaveBeenCalledWith({
        id: 0,
        leaveType: 'Maternity Leave',
        loginUserId: 50,
        centreId: null, // role 1 sends null
      });
      expect(toastrSpy.success).toHaveBeenCalledWith('Leave created successfully');
      expect(component.leaveTypeRefresh.emit).toHaveBeenCalled();
      expect(component.submitted).toBe(false);
      expect(spinnerSpy.hide).toHaveBeenCalled();
    });

    it('should submit with daycareCentreId when userRoleId is not 1', () => {
      cookieServiceSpy.get.and.callFake((key: string) => {
        if (key === 'UserRoleId') return '2';
        return '10';
      });

      component.daycareCentreId = 10;
      component.loginUserId = 50;
      component.leaveForm.patchValue({ id: 0, leaveType: 'Paternity Leave' });

      leaveTypeServiceSpy.manageLeave.and.returnValue(
        of({ message: 'Leave created successfully' })
      );

      component.onSubmit();

      expect(leaveTypeServiceSpy.manageLeave).toHaveBeenCalledWith(
        jasmine.objectContaining({
          centreId: 10,
        })
      );
    });

    it('should handle error when manageLeave fails', () => {
      component.leaveForm.patchValue({ id: 0, leaveType: 'Vacation' });
      leaveTypeServiceSpy.manageLeave.and.returnValue(
        throwError(() => new Error('Creation failed'))
      );

      component.onSubmit();

      expect(toastrSpy.error).toHaveBeenCalledWith('Creation failed');
      expect(spinnerSpy.hide).toHaveBeenCalled();
    });
  });

  describe('editLeave and reset', () => {
    it('should patch form and set isEdit on editLeave', () => {
      const item = { id: 5, leaveType: 'Sick Leave' };
      component.editLeave(item);

      expect(component.isEdit).toBe(5);
      expect(component.leaveForm.value.leaveType).toBe('Sick Leave');
    });

    it('should reset isEdit and form on reset()', () => {
      component.isEdit = 5;
      component.leaveForm.patchValue({ leaveType: 'Sick Leave' });

      component.reset();

      expect(component.isEdit).toBeNull();
      expect(component.leaveForm.value.leaveType).toBeNull();
    });
  });

  describe('toggleStatus', () => {
    beforeEach(() => {
      component.leaveTypeList = [
        { id: 1, leaveType: 'Sick Leave', isActive: true },
        { id: 2, leaveType: 'Casual Leave', isActive: false },
      ];
    });

    it('should call activeInactive and refresh list when confirmed in Swal', async () => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      leaveTypeServiceSpy.activeInactive.and.returnValue(
        of({ message: 'Status updated' })
      );
      spyOn(component, 'getLeaveList');

      await component.toggleStatus(1, true);

      expect(spinnerSpy.show).toHaveBeenCalled();
      expect(leaveTypeServiceSpy.activeInactive).toHaveBeenCalledWith(1);
      expect(toastrSpy.success).toHaveBeenCalledWith('Status updated');
      expect(component.getLeaveList).toHaveBeenCalled();
      expect(spinnerSpy.hide).toHaveBeenCalled();
    });

    it('should revert isActive state when cancelled in Swal', async () => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: false } as any));

      await component.toggleStatus(1, true);

      expect(leaveTypeServiceSpy.activeInactive).not.toHaveBeenCalled();
      // Reverted from true to false
      expect(component.leaveTypeList[0].isActive).toBe(false);
    });

    it('should handle error in activeInactive API', async () => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      leaveTypeServiceSpy.activeInactive.and.returnValue(
        throwError(() => new Error('Toggle error'))
      );

      await component.toggleStatus(2, false);

      expect(toastrSpy.error).toHaveBeenCalledWith('Toggle error');
      expect(spinnerSpy.hide).toHaveBeenCalled();
    });
  });
});
