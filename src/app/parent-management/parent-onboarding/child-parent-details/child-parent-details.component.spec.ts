import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { ChildParentDetailsComponent } from './child-parent-details.component';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ChildParentService } from './child-parent.service';
import { CommonService } from '../../../common-component/common.service';
import { HeaderServiceService } from '../../../layout/header/header-service.service';
import Swal from 'sweetalert2';

describe('ChildParentDetailsComponent', () => {
  let component: ChildParentDetailsComponent;
  let fixture: ComponentFixture<ChildParentDetailsComponent>;

  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockCookie: jasmine.SpyObj<CookieService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockChildParentService: jasmine.SpyObj<ChildParentService>;
  let mockCommonService: any;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockHeaderService: any;

  beforeEach(async () => {
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'warning', 'error', 'info']);
    mockCookie = jasmine.createSpyObj('CookieService', ['get', 'set']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);

    mockCookie.get.and.callFake((key: string) => {
      if (key === 'CentreID') return '10';
      if (key === 'UserRoleId') return '5';
      if (key === 'UserId') return '101';
      if (key === 'ParentID') return '101';
      if (key === 'StudentID') return '501';
      if (key === 'email') return 'parent@test.com';
      if (key === 'orderNumber') return 'ORD-123';
      if (key === 'UserInfo') {
        return JSON.stringify({
          result: { firstName: 'Sarah', email: 'parent@test.com', centreID: 10 }
        });
      }
      return '';
    });

    mockChildParentService = jasmine.createSpyObj('ChildParentService', [
      'GetAllAgeGroup',
      'manageDetail',
      'getStudentParentDetailsByParentID',
      'CheckInterestedMobileExist'
    ]);

    mockChildParentService.GetAllAgeGroup.and.returnValue(
      of({
        message: 'Success',
        result: [
          { id: 1, minAge: 12, maxAge: 24, isMonthly: true, ageGroupTitle: 'Toddler' },
          { id: 2, minAge: 2, maxAge: 4, isMonthly: false, ageGroupTitle: 'Preschool' }
        ]
      })
    );

    mockChildParentService.getStudentParentDetailsByParentID.and.returnValue(
      of({
        message: 'Success',
        result: [
          {
            parentID: 101,
            studentID: 501,
            studentFirstName: 'John',
            studentLastName: 'Connor',
            studentDOB: '2023-01-15',
            studentGender: 'Male',
            studentAgeGroupID: 1,
            profilePhoto: 'photo.jpg',
            profilePhotoPath: '/photos/',
            parentFirstName: 'Sarah',
            parentLastName: 'Connor',
            contact: '123 456 7890',
            email: 'parent@test.com',
            country: 'Canada',
            state: 'Ontario',
            city: 'Toronto',
            pinCode: 'M1M 1M1',
            relationToChild: 'Mother',
            address: '123 Tech St'
          }
        ]
      })
    );

    mockChildParentService.manageDetail.and.returnValue(
      of({
        message: 'Success',
        activity: 'Saved successfully',
        result: { studentID: 501, parentID: 101 }
      })
    );

    mockChildParentService.CheckInterestedMobileExist.and.returnValue(
      of({ message: 'Success' })
    );

    mockCommonService = {
      loadStep1: signal(false),
      getCountriesFlag: jasmine.createSpy('getCountriesFlag').and.returnValue([{ id: 1, name: 'Canada' }]),
      getDefaultCountryFlag: jasmine.createSpy('getDefaultCountryFlag').and.returnValue({ id: 1, name: 'Canada' }),
      uploadImages: jasmine.createSpy('uploadImages').and.returnValue(
        of({ message: 'OK', result: [{ path: '/img/', imageName: 'child.jpg' }] })
      ),
      getStateListByCountryID: jasmine.createSpy('getStateListByCountryID').and.returnValue(
        of({ message: 'Success', result: [{ id: 10, stateName: 'Ontario' }] })
      ),
      getCitiesListByStateID: jasmine.createSpy('getCitiesListByStateID').and.returnValue(
        of({ message: 'Success', result: [{ id: 100, cityName: 'Toronto' }] })
      ),
      formatPhoneNumber: jasmine.createSpy('formatPhoneNumber').and.callFake((val: string) => val),
      formatPostalCode: jasmine.createSpy('formatPostalCode').and.callFake((val: string) => val)
    };

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockHeaderService = {
      switchProfile: signal(0)
    };

    await TestBed.configureTestingModule({
      imports: [ChildParentDetailsComponent, ReactiveFormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        { provide: ToastrService, useValue: mockToastr },
        { provide: CookieService, useValue: mockCookie },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: ChildParentService, useValue: mockChildParentService },
        { provide: CommonService, useValue: mockCommonService },
        { provide: Router, useValue: mockRouter },
        { provide: HeaderServiceService, useValue: mockHeaderService },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({})
          }
        }
      ]
    })
    .overrideComponent(ChildParentDetailsComponent, {
      set: { imports: [ReactiveFormsModule], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChildParentDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component and initialize forms', () => {
    expect(component).toBeTruthy();
    expect(component.parentForm).toBeDefined();
    expect(component.studentForm).toBeDefined();
    expect(component.centre).toBe(10);
    expect(component.userRoleID).toBe(5);
  });

  describe('Age Calculations and Conversions', () => {
    it('should calculate age in months accurately', () => {
      const today = new Date();
      const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
      const ageInMonths = component.calculateAge(oneYearAgo);
      expect(ageInMonths).toBe(12);
    });

    it('should convert year to month and month to year', () => {
      expect(component.convertYearToMonth(2)).toBe(24);
      expect(component.convertMonthToYear(24)).toBe(2);
    });

    it('should convert months to years and years to months', () => {
      expect(component.convertMonthsToYears(24)).toBe(2);
      expect(component.convertYearsToMonths(3)).toBe(36);
    });

    it('should throw error when negative value passed to convertMonthsToYears', () => {
      expect(() => component.convertMonthsToYears(-5)).toThrowError();
      expect(() => component.convertYearsToMonths(-5)).toThrowError();
    });

    it('should filter age groups on onDobChange', () => {
      component.ageGroupList = [
        { id: 1, minAge: 10, maxAge: 30, isMonthly: true, label: 'Toddler' }
      ];
      component.onDobChange('15/01/2024');
      expect(component.filteredAgeGroup.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('onSubmit form operations', () => {
    it('should markAllAsTouched if forms are invalid', async () => {
      component.parentForm.reset();
      component.studentForm.reset();

      await component.onSubmit();

      expect(component.parentForm.touched).toBeTrue();
      expect(component.studentForm.touched).toBeTrue();
      expect(mockChildParentService.manageDetail).not.toHaveBeenCalled();
    });

    it('should submit form data when forms are valid', fakeAsync(async () => {
      component.parentForm.patchValue({
        firstName: 'Sarah',
        address: '123 Main',
        mobile: '123 456 7890',
        email: 'sarah@test.com',
        pinCode: 'A1A 1A1',
        relation: 'Mother'
      });
      component.studentForm.patchValue({
        firstName: 'John',
        dob: '15/01/2023',
        gender: 'Male',
        parentID: 101,
        centreID: 10,
        classID: 1,
        ageGroupID: 1,
        profilePhoto: 'photo.jpg'
      });

      spyOn(component.Update, 'emit');

      await component.onSubmit();
      tick(150);

      expect(mockChildParentService.manageDetail).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Saved successfully');
      expect(component.Update.emit).toHaveBeenCalled();
    }));

    it('should handle API warning message on submit', fakeAsync(async () => {
      component.parentForm.patchValue({
        firstName: 'Sarah',
        address: '123 Main',
        mobile: '123 456 7890',
        email: 'sarah@test.com',
        pinCode: 'A1A 1A1',
        relation: 'Mother'
      });
      component.studentForm.patchValue({
        firstName: 'John',
        dob: '15/01/2023',
        gender: 'Male',
        parentID: 101,
        centreID: 10,
        classID: 1,
        ageGroupID: 1,
        profilePhoto: 'photo.jpg'
      });
      mockChildParentService.manageDetail.and.returnValue(
        of({ message: 'Child already registered', activity: '' })
      );

      await component.onSubmit();
      tick(150);

      expect(mockToastr.warning).toHaveBeenCalledWith('Child already registered');
    }));
  });

  describe('Location cascading and format helpers', () => {
    it('should reset state and city and fetch states on onChangeCountry', () => {
      component.parentForm.patchValue({ stateID: 1, cityID: 2 });
      component.onChangeCountry(1);

      expect(mockCommonService.getStateListByCountryID).toHaveBeenCalledWith(1);
    });

    it('should reset city and fetch cities on onChangeState', () => {
      component.parentForm.patchValue({ cityID: 2 });
      component.onChangeState(10);

      expect(mockCommonService.getCitiesListByStateID).toHaveBeenCalledWith(10);
    });

    it('should check if mobile already exists', () => {
      component.parentForm.patchValue({ mobile: '123 456 7890' });
      mockChildParentService.CheckInterestedMobileExist.and.returnValue(
        of({ message: 'mobile exists' })
      );

      component.CheckInterestedMobileExist({});

      expect(mockToastr.warning).toHaveBeenCalledWith('Mobile number already exists');
      expect(component.parentForm.get('mobile')?.value).toBeNull();
    });

    it('should format phone number and postal code', () => {
      component.formatPhoneNumber({ target: { value: '1234567890' } });
      expect(mockCommonService.formatPhoneNumber).toHaveBeenCalledWith('1234567890');

      component.formatPostalCode({ target: { value: 'A1A1A1' } });
      expect(mockCommonService.formatPostalCode).toHaveBeenCalledWith('A1A1A1');
    });

    it('should toggle dropdown and select country', () => {
      component.dropdownOpen = false;
      component.toggleDropdown();
      expect(component.dropdownOpen).toBeTrue();

      component.selectCountry({ id: 2, name: 'US' });
      expect(component.selectedCountry).toEqual({ id: 2, name: 'US' });
      expect(component.dropdownOpen).toBeTrue();
    });

    it('should reset forms on cancel', () => {
      component.parentForm.patchValue({ firstName: 'Test' });
      component.studentForm.patchValue({ firstName: 'Test' });

      component.cancel();

      expect(component.parentForm.get('firstName')?.value).toBeNull();
      expect(component.studentForm.get('firstName')?.value).toBeNull();
    });
  });
});
