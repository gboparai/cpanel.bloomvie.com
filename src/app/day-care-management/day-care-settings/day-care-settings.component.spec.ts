import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DayCareSettingsComponent } from './day-care-settings.component';
import { DaycareService } from './daycare.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { CookieService } from 'ngx-cookie-service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

describe('DayCareSettingsComponent', () => {
  let component: DayCareSettingsComponent;
  let fixture: ComponentFixture<DayCareSettingsComponent>;

  let mockDaycareService: jasmine.SpyObj<DaycareService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockCookieService: jasmine.SpyObj<CookieService>;

  beforeEach(async () => {
    mockDaycareService = jasmine.createSpyObj('DaycareService', [
      'getAllActivites',
      'getAllClasses',
      'getAllAgeGroup',
      'getAllFacility',
      'assignmentActivitesForDayCare',
      'assignAgeGroupsForDayCare',
      'assignFacilityForDayCare',
      'assignClassRoomForDayCare',
      'editDayCareSettings',
    ]);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'check']);

    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'CentreID') return '101';
      if (key === 'UserRoleId') return '3';
      return '';
    });

    mockDaycareService.getAllActivites.and.returnValue(
      of({ message: 'Ok', result: [{ activityID: 1, activityName: 'Painting' }] })
    );
    mockDaycareService.getAllClasses.and.returnValue(
      of({ message: 'OK', result: [{ classID: 2, className: 'Preschool' }] })
    );
    mockDaycareService.getAllAgeGroup.and.returnValue(
      of({ message: 'Success', result: [{ ageGroupID: 3, ageGroupTitle: 'Toddler' }] })
    );
    mockDaycareService.getAllFacility.and.returnValue(
      of({ message: 'OK', result: [{ facilityID: 4, facilityName: 'Playground' }] })
    );
    mockDaycareService.editDayCareSettings.and.returnValue(
      of({
        message: 'OK',
        result: {
          classes: [{ classID: 2 }],
          activities: [{ activityID: 1 }],
          ageGroups: [{ ageGroupID: 3 }],
          facilities: [{ facilityID: 4 }],
        },
      })
    );

    await TestBed.configureTestingModule({
      imports: [DayCareSettingsComponent],
      providers: [
        { provide: DaycareService, useValue: mockDaycareService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: CookieService, useValue: mockCookieService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(DayCareSettingsComponent, {
        set: {
          imports: [],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(DayCareSettingsComponent);
    component = fixture.componentInstance;
  });

  it('should create DayCareSettingsComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit & Data Loading', () => {
    it('should initialize and fetch all settings, activities, age groups, classes, and facilities', async () => {
      component.ngOnInit();
      await fixture.whenStable();

      expect(component.centreID).toBe(101);
      expect(component.userRoleID).toBe(3);
      expect(mockDaycareService.getAllActivites).toHaveBeenCalled();
      expect(mockDaycareService.getAllClasses).toHaveBeenCalled();
      expect(mockDaycareService.getAllAgeGroup).toHaveBeenCalled();
      expect(mockDaycareService.getAllFacility).toHaveBeenCalled();
      expect(mockDaycareService.editDayCareSettings).toHaveBeenCalledWith(101);
    });

    it('should populate AgeList on successful getAllAgeGroup', async () => {
      await component.getAllAgeGroup();
      expect(component.AgeList.length).toBe(1);
      expect(component.AgeList[0].ageGroupID).toBe(3);
    });

    it('should handle getAllAgeGroup error gracefully', async () => {
      mockDaycareService.getAllAgeGroup.and.returnValue(
        throwError(() => ({ error: { message: 'Failed to load' } }))
      );
      await component.getAllAgeGroup();
      expect(mockToastr.error).toHaveBeenCalledWith('Failed to load');
    });

    it('should populate FacilityList on successful getAllFacility', async () => {
      await component.getAllFacility();
      expect(component.FacilityList.length).toBe(1);
      expect(component.FacilityList[0].facilityID).toBe(4);
    });
  });

  describe('Checkbox Selection Handlers', () => {
    it('should handle onActivityboxChange selection and deselection', () => {
      component.selectedPlans = [];
      component.unselectedActivity = [];

      component.onActivityboxChange({ target: { checked: true } }, 1);
      expect(component.selectedPlans).toContain(1);

      component.onActivityboxChange({ target: { checked: false } }, 1);
      expect(component.selectedPlans).not.toContain(1);
      expect(component.unselectedActivity).toContain(1);
    });

    it('should handle onBoxClass selection and deselection', () => {
      component.selectedClass = [];
      component.unselectedClass = [];

      component.onBoxClass({ target: { checked: true } }, 2);
      expect(component.selectedClass).toContain(2);

      component.onBoxClass({ target: { checked: false } }, 2);
      expect(component.selectedClass).not.toContain(2);
      expect(component.unselectedClass).toContain(2);
    });

    it('should handle onBoxAge selection and deselection', () => {
      component.selectedAge = [];
      component.unselectedAgeGroup = [];

      component.onBoxAge({ target: { checked: true } }, 3);
      expect(component.selectedAge).toContain(3);

      component.onBoxAge({ target: { checked: false } }, 3);
      expect(component.selectedAge).not.toContain(3);
      expect(component.unselectedAgeGroup).toContain(3);
    });

    it('should handle onBoxFacility selection and deselection', () => {
      component.selectedFacility = [];
      component.unselectedFacility = [];

      component.onBoxFacility({ target: { checked: true } }, 4);
      expect(component.selectedFacility).toContain(4);

      component.onBoxFacility({ target: { checked: false } }, 4);
      expect(component.selectedFacility).not.toContain(4);
      expect(component.unselectedFacility).toContain(4);
    });
  });

  describe('Submit Settings Data', () => {
    it('should submit all selected and unselected settings successfully', async () => {
      component.selectedPlans = [1];
      component.selectedAge = [3];
      component.selectedClass = [2];
      component.selectedFacility = [4];

      mockDaycareService.assignmentActivitesForDayCare.and.returnValue(of({ message: 'OK' }));
      mockDaycareService.assignAgeGroupsForDayCare.and.returnValue(of({ message: 'OK' }));
      mockDaycareService.assignFacilityForDayCare.and.returnValue(of({ message: 'OK' }));
      mockDaycareService.assignClassRoomForDayCare.and.returnValue(
        of({ message: 'OK', activity: 'Updated' })
      );

      await component.submitData();

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(mockDaycareService.assignmentActivitesForDayCare).toHaveBeenCalled();
      expect(mockDaycareService.assignAgeGroupsForDayCare).toHaveBeenCalled();
      expect(mockDaycareService.assignFacilityForDayCare).toHaveBeenCalled();
      expect(mockDaycareService.assignClassRoomForDayCare).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Classrooms  Settings updated successfully!');
    });

    it('should handle error when submission fails', async () => {
      mockDaycareService.assignmentActivitesForDayCare.and.returnValue(
        throwError(() => new Error('Submission error'))
      );

      await component.submitData();

      expect(mockToastr.error).toHaveBeenCalledWith('Error while submitting data.');
    });
  });
});
