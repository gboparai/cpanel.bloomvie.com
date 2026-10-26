import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AssignClassComponent } from './assign-class.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { AssignClassService } from './assign-class.service';
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '../../../common-component/common.service';
import { OnboardingService } from '../../../onboarding/onboarding.service';
import { DatePipe } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

describe('AssignClassComponent', () => {
  let component: AssignClassComponent;
  let fixture: ComponentFixture<AssignClassComponent>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockAssignClassService: jasmine.SpyObj<AssignClassService>;
  let mockCookie: jasmine.SpyObj<CookieService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockOnboardingService: any;

  beforeEach(async () => {
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'warning', 'error', 'info']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockAssignClassService = jasmine.createSpyObj('AssignClassService', [
      'getAllDays',
      'getDaycareClasses',
      'getAllAvailableTeachersByCentreID',
      'BulkClassAssignment',
    ]);
    mockCookie = jasmine.createSpyObj('CookieService', ['get', 'check']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['decrypt', 'manageDaycareOnBoarding']);

    mockCookie.get.and.callFake((key: string) => {
      if (key === 'UserRoleId') return '3';
      if (key === 'CentreID') return '10';
      if (key === 'UserId') return '25';
      return '';
    });
    mockCookie.check.and.returnValue(true);

    mockAssignClassService.getAllDays.and.returnValue(of({
      message: 'Success',
      result: [
        { id: 1, day: 'Monday' },
        { id: 2, day: 'Tuesday' },
      ],
    }));
    mockAssignClassService.getDaycareClasses.and.returnValue(of({
      message: 'Success',
      result: [{ id: 101, name: 'Toddler A' }],
    }));

    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal'),
      val: jasmine.createSpy('val'),
    });

    mockOnboardingService = {
      isOnboarding: true,
      onBoardingData: { isCompleteStep6: false },
      handleNext: jasmine.createSpy('handleNext'),
      getCurrentTab: jasmine.createSpy('getCurrentTab'),
    };

    await TestBed.configureTestingModule({
      imports: [AssignClassComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        DatePipe,
        { provide: ToastrService, useValue: mockToastr },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: AssignClassService, useValue: mockAssignClassService },
        { provide: CookieService, useValue: mockCookie },
        { provide: CommonService, useValue: mockCommonService },
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
      .overrideComponent(AssignClassComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AssignClassComponent);
    component = fixture.componentInstance;
  });

  it('should create AssignClassComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization and ngOnInit', () => {
    it('should initialize form controls and retrieve class/day lists', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(component.UserRoleID).toBe(3);
      expect(component.centreID).toBe(10);
      expect(component.loginUserID).toBe(25);
      expect(mockAssignClassService.getDaycareClasses).toHaveBeenCalledWith(10);
      expect(mockAssignClassService.getAllDays).toHaveBeenCalled();
    }));
  });

  describe('Slot and Assignment operations', () => {
    it('should edit slot and update assignClassForm', () => {
      component.TempAssignmentList = [
        {
          slotID: 1,
          dayID: 1,
          classSlotID: 2,
          classID: 10,
          teacherID: 5,
          startTime: '09:00:00',
          endTime: '12:00:00',
        },
      ];

      component.editSlot(0);

      expect(component.isUpdate).toBeTrue();
      expect(component.assignClassForm.value.startTime).toBe('09:00');
      expect(component.assignClassForm.value.endTime).toBe('12:00');
    });

    it('should update assignment list on updateAssignmentList()', () => {
      component.TempAssignmentList = [
        {
          slotID: 1,
          dayID: 1,
          classSlotID: 2,
          classID: 10,
          teacherID: 5,
          startTime: '09:00',
          endTime: '12:00',
        },
      ];
      component.assignClassForm.patchValue({
        startTime: '10:00',
        endTime: '13:00',
      });

      component.updateAssignmentList();

      expect(component.TempAssignmentList[0].startTime).toBe('10:00');
      expect(component.TempAssignmentList[0].endTime).toBe('13:00');
      expect(component.isUpdate).toBeFalse();
    });

    it('should remove slot from TempAssignmentList in removeList()', () => {
      component.TempAssignmentList = [
        { slotID: 1 } as any,
        { slotID: 2 } as any,
      ];

      component.removeList(0);

      expect(component.TempAssignmentList.length).toBe(1);
      expect(component.TempAssignmentList[0].slotID).toBe(2);
    });

    it('should check if teacher is assigned to day in isChecked()', () => {
      component.AssignmentBO = [
        {
          teacherID: 5,
          slots: [
            { slotID: 1, dayID: 1, classSlotID: 1, classID: 1, teacherID: 5, startTime: '09:00', endTime: '10:00' },
          ],
        },
      ];

      expect(component.isChecked({ teacherID: 5 }, 1)).toBeTrue();
      expect(component.isChecked({ teacherID: 5 }, 2)).toBeFalse();
    });
  });

  describe('assignClass', () => {
    it('should populate class details and call getAllAvailableTeachersByCentreID', () => {
      component.masterDays = [
        { id: 1, day: 'Monday' },
        { id: 2, day: 'Tuesday' },
      ];
      spyOn(component, 'getAllAvailableTeachersByCentreID');

      const mockEvent = {
        id: 15,
        name: 'Preschool',
        primaryDayCareID: 1,
        dayID: [{ dayID: 1, slotID: 100 }],
      };

      component.assignClass(mockEvent);

      expect(component.classID).toBe(15);
      expect(component.className).toBe('Preschool');
      expect(component.getAllAvailableTeachersByCentreID).toHaveBeenCalled();
    });

    it('should reset properties if event is null', () => {
      component.assignClass(null);

      expect(component.classID).toBe(0);
      expect(component.className).toBe('');
      expect(component.classDaysSlot).toEqual([]);
      expect(component.teachersData).toEqual([]);
    });
  });

  describe('Bulk Assignment and Onboarding', () => {
    it('should submit bulk assignment via service', () => {
      component.AssignmentBO = [
        {
          teacherID: 5,
          classID: 10,
          slots: [
            { slotID: 1, dayID: 1, classSlotID: 1, classID: 10, teacherID: 5, startTime: '09:00', endTime: '10:00' },
          ],
        },
      ];
      mockAssignClassService.BulkClassAssignment.and.returnValue(of({
        message: 'Success',
        activity: 'Classes assigned successfully',
      }));

      component.manageBulkAssignment();

      expect(mockAssignClassService.BulkClassAssignment).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Classes assigned successfully');
    });

    it('should advance onboarding step on proceedToOnboarding()', () => {
      mockCommonService.manageDaycareOnBoarding.and.returnValue(of({ message: 'Success' }));
      component.onBoardingService.onBoardingData.isCompleteStep6 = false;

      component.proceedToOnboarding();

      expect(mockCommonService.manageDaycareOnBoarding).toHaveBeenCalled();
      expect(component.onBoardingService.onBoardingData.isCompleteStep6).toBeTrue();
      expect(mockOnboardingService.handleNext).toHaveBeenCalledWith('Tab-6');
    });
  });
});
