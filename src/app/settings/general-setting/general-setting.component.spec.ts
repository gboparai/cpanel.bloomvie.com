import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { GeneralSettingComponent } from './general-setting.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { CommonService } from '../../common-component/common.service';
import { OnboardingService } from '../../onboarding/onboarding.service';
import { AddAgeGroupService } from '../../master-settings/age-group/add-age-group/add-age-group.service';
import { AddMasterFacilityService } from '../../master-settings/add-master-facility/add-master-facility.service';
import { AddMasterActivityService } from '../../master-settings/add-master-activity/add-master-activity.service';
import { GeneralSettingService } from './general-setting.service';
import { DaycareService } from '../../day-care-management/day-care-settings/daycare.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

describe('GeneralSettingComponent', () => {
  let component: GeneralSettingComponent;
  let fixture: ComponentFixture<GeneralSettingComponent>;
  let mockAgeGroupService: jasmine.SpyObj<AddAgeGroupService>;
  let mockFacilityService: jasmine.SpyObj<AddMasterFacilityService>;
  let mockActivityService: jasmine.SpyObj<AddMasterActivityService>;
  let mockGeneralSettingService: jasmine.SpyObj<GeneralSettingService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockCookie: jasmine.SpyObj<CookieService>;
  let mockOnboardingService: any;
  let mockDaycareService: jasmine.SpyObj<DaycareService>;

  beforeEach(async () => {
    mockAgeGroupService = jasmine.createSpyObj('AddAgeGroupService', ['ManageAgeGroup']);
    mockFacilityService = jasmine.createSpyObj('AddMasterFacilityService', ['ManageFacility']);
    mockActivityService = jasmine.createSpyObj('AddMasterActivityService', ['GetAllActivities']);
    mockGeneralSettingService = jasmine.createSpyObj('GeneralSettingService', [
      'getAllAgeGroupsByUserID',
      'getAllFacilityByUserId',
      'getAllActivitiesByUserId',
      'getEntitiesByCenter',
      'assignEntitiesToCenter',
      'manageMasterActivites',
    ]);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'warning', 'error']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockCommonService = jasmine.createSpyObj('CommonService', [
      'decrypt',
      'manageDaycareOnBoarding',
      'updateLoadSideBar',
    ]);
    mockCookie = jasmine.createSpyObj('CookieService', ['check', 'get']);
    mockOnboardingService = {
      onBoardingData: { isCompleteStep2: false },
      handleNext: jasmine.createSpy('handleNext'),
      getCurrentTab: jasmine.createSpy('getCurrentTab'),
    };
    mockDaycareService = jasmine.createSpyObj('DaycareService', [
      'getCentreSettings',
      'updateCentreSettings',
      'notifyExternalBillingChanged',
    ]);

    mockGeneralSettingService.getAllAgeGroupsByUserID.and.returnValue(
      of({
        message: 'Success',
        result: [
          { id: 1, minAge: 12, maxAge: 24, isMonthly: true },
          { id: 2, minAge: 2, maxAge: 5, isMonthly: false },
        ],
      })
    );

    mockGeneralSettingService.getAllFacilityByUserId.and.returnValue(
      of({
        message: 'Success',
        result: [{ facilityID: 10, facilityName: 'Playground', createdBy: 1 }],
      })
    );

    mockGeneralSettingService.getAllActivitiesByUserId.and.returnValue(
      of({
        message: 'Ok',
        result: [{ id: 20, activityName: 'Painting' }],
      })
    );

    mockGeneralSettingService.getEntitiesByCenter.and.returnValue(
      of({
        message: 'Success',
        result: { ageGroups: [1], facilities: [10], activities: [20] },
      })
    );

    mockDaycareService.getCentreSettings.and.returnValue(
      of({
        message: 'Success',
        result: { externalBillingEnabled: false },
      })
    );

    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal'),
    });

    await TestBed.configureTestingModule({
      imports: [GeneralSettingComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: AddAgeGroupService, useValue: mockAgeGroupService },
        { provide: AddMasterFacilityService, useValue: mockFacilityService },
        { provide: AddMasterActivityService, useValue: mockActivityService },
        { provide: GeneralSettingService, useValue: mockGeneralSettingService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: CommonService, useValue: mockCommonService },
        { provide: CookieService, useValue: mockCookie },
        { provide: OnboardingService, useValue: mockOnboardingService },
        { provide: DaycareService, useValue: mockDaycareService },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap({ enc_id: 'encCentreId' })),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(GeneralSettingComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(GeneralSettingComponent);
    component = fixture.componentInstance;
  });

  it('should create and initialize default forms and arrays', () => {
    expect(component).toBeTruthy();
    expect(component.form).toBeDefined();
    expect(component.ageGroupForm).toBeDefined();
    expect(component.facilityForm).toBeDefined();
    expect(component.activityForm).toBeDefined();
    expect(component.ageGroupsControls).toBeDefined();
    expect(component.facilitiesControls).toBeDefined();
    expect(component.activitiesControls).toBeDefined();
  });

  describe('conversions', () => {
    it('convertMonthsToYears should convert accurately or throw on negative', () => {
      expect(component.convertMonthsToYears(24)).toBe(2);
      expect(component.convertMonthsToYears(25)).toBe(2);
      expect(() => component.convertMonthsToYears(-1)).toThrowError(
        'Invalid input: months cannot be negative.'
      );
    });

    it('convertYearsToMonths should convert accurately or throw on negative', () => {
      expect(component.convertYearsToMonths(2)).toBe(24);
      expect(() => component.convertYearsToMonths(-1)).toThrowError(
        'Invalid input: years cannot be negative.'
      );
    });
  });

  describe('ngOnInit and loadAllLists', () => {
    it('should decrypt enc_id and load lists and external billing settings', async () => {
      mockCommonService.decrypt.and.returnValue('55');
      mockCookie.check.and.returnValue(true);
      mockCookie.get.and.returnValue('12');

      component.ngOnInit();

      expect(mockCommonService.decrypt).toHaveBeenCalledWith('encCentreId');
      expect(component.centreID).toBe(55);
      expect(component.loginUserID).toBe(12);
      expect(mockGeneralSettingService.getAllAgeGroupsByUserID).toHaveBeenCalledWith(12);
      expect(mockGeneralSettingService.getAllFacilityByUserId).toHaveBeenCalledWith(12);
      expect(mockGeneralSettingService.getAllActivitiesByUserId).toHaveBeenCalledWith(12);
      expect(mockDaycareService.getCentreSettings).toHaveBeenCalledWith(55);
      expect(component.ageGroupList.length).toBe(2);
      expect(component.facilityList.length).toBe(1);
      expect(component.activityList.length).toBe(1);
    });

    it('should read centreID from cookie if enc_id is absent', () => {
      TestBed.resetTestingModule();
      mockCookie.check.and.callFake((name: string) => name === 'CentreID');
      mockCookie.get.and.callFake((name: string) => (name === 'CentreID' ? '88' : ''));

      TestBed.configureTestingModule({
        imports: [GeneralSettingComponent, ReactiveFormsModule],
        providers: [
          FormBuilder,
          { provide: AddAgeGroupService, useValue: mockAgeGroupService },
          { provide: AddMasterFacilityService, useValue: mockFacilityService },
          { provide: AddMasterActivityService, useValue: mockActivityService },
          { provide: GeneralSettingService, useValue: mockGeneralSettingService },
          { provide: ToastrService, useValue: mockToastr },
          { provide: NgxSpinnerService, useValue: mockSpinner },
          { provide: CommonService, useValue: mockCommonService },
          { provide: CookieService, useValue: mockCookie },
          { provide: OnboardingService, useValue: mockOnboardingService },
          { provide: DaycareService, useValue: mockDaycareService },
          {
            provide: ActivatedRoute,
            useValue: { queryParamMap: of(convertToParamMap({})) },
          },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      })
        .overrideComponent(GeneralSettingComponent, {
          set: {
            imports: [ReactiveFormsModule],
            schemas: [NO_ERRORS_SCHEMA],
          },
        })
        .compileComponents();

      const newFixture = TestBed.createComponent(GeneralSettingComponent);
      const newComp = newFixture.componentInstance;
      newComp.ngOnInit();

      expect(newComp.centreID).toBe(88);
    });
  });

  describe('selection methods and trackingFields', () => {
    it('should update selectAgeGroups on change', () => {
      component.selectageGroups(1, { target: { checked: true } });
      expect(component.selectAgeGroups).toContain(1);

      component.selectageGroups(1, { target: { checked: false } });
      expect(component.selectAgeGroups).not.toContain(1);
    });

    it('should update selectFacility on change', () => {
      component.selectFacilities(10, { target: { checked: true } });
      expect(component.selectFacility).toContain(10);

      component.selectFacilities(10, { target: { checked: false } });
      expect(component.selectFacility).not.toContain(10);
    });

    it('should update selectActivities on change', () => {
      component.selectActivity(20, { target: { checked: true } });
      expect(component.selectActivities).toContain(20);

      component.selectActivity(20, { target: { checked: false } });
      expect(component.selectActivities).not.toContain(20);
    });

    it('should evaluate trackingFields correctly', () => {
      component.externalBillingEnabled = true;
      component.initialExternalBillingEnabled = false;
      component.trackingFields();
      expect(component.trackForm).toBeFalse();

      component.externalBillingEnabled = false;
      component.initialExternalBillingEnabled = false;
      component.form.patchValue({
        ageGroups: [true],
        facilities: [true],
        activities: [true],
      });
      component.trackingFields();
      expect(component.trackForm).toBeFalse();
    });
  });

  describe('onSubmit entities to center', () => {
    it('should submit selected entities and advance onboarding if step2 incomplete', () => {
      component.centreID = 10;
      component.ageGroupList = [{ id: 1 }];
      component.facilityList = [{ id: 2 }];
      component.activityList = [{ id: 3 }];
      component.initializeCheckboxes({ ageGroups: [1], facilities: [2], activities: [3] });

      mockGeneralSettingService.assignEntitiesToCenter.and.returnValue(
        of({ message: 'Success' })
      );
      mockDaycareService.updateCentreSettings.and.returnValue(of({ message: 'Success' }));
      mockCommonService.manageDaycareOnBoarding.and.returnValue(
        of({ message: 'Success' })
      );

      mockOnboardingService.onBoardingData.isCompleteStep2 = false;

      component.onSubmit();

      expect(mockGeneralSettingService.assignEntitiesToCenter).toHaveBeenCalled();
      expect(mockDaycareService.updateCentreSettings).toHaveBeenCalled();
      expect(mockCommonService.manageDaycareOnBoarding).toHaveBeenCalled();
      expect(mockOnboardingService.onBoardingData.isCompleteStep2).toBeTrue();
      expect(mockOnboardingService.handleNext).toHaveBeenCalledWith('Tab-2');
    });

    it('should show success toastr if step2 was already completed', () => {
      component.centreID = 10;
      component.ageGroupList = [{ id: 1 }];
      component.facilityList = [{ id: 2 }];
      component.activityList = [{ id: 3 }];
      component.initializeCheckboxes({ ageGroups: [1], facilities: [2], activities: [3] });

      mockGeneralSettingService.assignEntitiesToCenter.and.returnValue(
        of({ message: 'Success' })
      );
      mockDaycareService.updateCentreSettings.and.returnValue(of({ message: 'Success' }));
      mockCommonService.manageDaycareOnBoarding.and.returnValue(
        of({ message: 'Success' })
      );

      mockOnboardingService.onBoardingData.isCompleteStep2 = true;

      component.onSubmit();

      expect(mockToastr.success).toHaveBeenCalledWith('Entities assigned to center successfully!');
      expect(mockOnboardingService.getCurrentTab).toHaveBeenCalled();
    });
  });

  describe('modal forms submission: age group, facility, activity', () => {
    it('onSubmitAgeGroup should submit, reset form, and hide modal on Success', fakeAsync(() => {
      component.ageGroupForm.patchValue({ minAge: 1, maxAge: 2, ageUnit: 'Month' });
      mockAgeGroupService.ManageAgeGroup.and.returnValue(
        of({ message: 'Success', activity: 'Age group added' })
      );

      component.onSubmitAgeGroup();
      tick(400);

      expect(mockAgeGroupService.ManageAgeGroup).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Age group added');
    }));

    it('onSubmitAgeGroup should show warning on non-Success', fakeAsync(() => {
      component.ageGroupForm.patchValue({ minAge: 1, maxAge: 2, ageUnit: 'Month' });
      mockAgeGroupService.ManageAgeGroup.and.returnValue(
        of({ message: 'Duplicate group', activity: '' })
      );

      component.onSubmitAgeGroup();
      tick(400);

      expect(mockToastr.warning).toHaveBeenCalledWith('Duplicate group');
    }));

    it('manageMasterActivities should submit activityForm and show success', async () => {
      component.activityForm.patchValue({
        activityName: 'Art',
        activityDescription: 'Drawing',
      });
      mockGeneralSettingService.manageMasterActivites.and.returnValue(
        of({ message: 'Success', activity: 'Activity created' })
      );

      await component.manageMasterActivities();

      expect(mockGeneralSettingService.manageMasterActivites).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Activity created');
    });

    it('onSubmitFacility should submit facilityForm and show success', fakeAsync(() => {
      component.facilityForm.patchValue({
        facilityName: 'Library',
        facilityDescription: 'Books',
      });
      mockFacilityService.ManageFacility.and.returnValue(
        of({ message: 'Success' })
      );

      component.onSubmitFacility();
      tick(400);

      expect(mockFacilityService.ManageFacility).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Facility saved successfully');
    }));
  });

  describe('numeric input & external billing toggle', () => {
    it('allowOnlyNumericInput should prevent default for non-numeric keys', () => {
      const event = new KeyboardEvent('keypress', { key: 'a' });
      spyOn(event, 'preventDefault');

      component.allowOnlyNumericInput(event);

      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('allowOnlyNumericInput should allow numeric keys', () => {
      const event = new KeyboardEvent('keypress', { key: '5' });
      spyOn(event, 'preventDefault');

      component.allowOnlyNumericInput(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('toggleExternalBilling should toggle boolean and mark trackForm false', () => {
      const event = { target: { checked: true } } as unknown as Event;
      component.toggleExternalBilling(event);

      expect(component.externalBillingEnabled).toBeTrue();
      expect(component.trackForm).toBeFalse();
    });
  });
});
