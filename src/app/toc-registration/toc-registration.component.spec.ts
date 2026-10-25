import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TOCRegistrationComponent, charOnlyValidator, commaSeparatedValidator } from './toc-registration.component';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ElementRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { TocRegistrationService } from './toc-registration.service';
import { CommonService } from '../common-component/common.service';
import { of, Subject, throwError } from 'rxjs';
import Swal from 'sweetalert2';

describe('TOCRegistrationComponent', () => {
  let component: TOCRegistrationComponent;
  let fixture: ComponentFixture<TOCRegistrationComponent>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockTocService: any;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let refreshSubject: Subject<void>;

  beforeEach(async () => {
    refreshSubject = new Subject<void>();
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'set', 'check']);
    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'UserId') return '101';
      if (key === 'UserRoleId') return '4';
      return '';
    });

    mockCommonService = jasmine.createSpyObj('CommonService', [
      'getCountriesFlag',
      'getDefaultCountryFlag',
      'getMasterAllQualifications',
      'formatPhoneNumber',
      'formatPostalCode',
      'convertS3File'
    ]);
    mockCommonService.getCountriesFlag.and.returnValue([
      { id: 1, name: 'Canada', code: 'CA', flag: 'flag_ca' },
      { id: 2, name: 'United States', code: 'US', flag: 'flag_us' }
    ]);
    mockCommonService.getDefaultCountryFlag.and.returnValue({
      id: 1, name: 'Canada', code: 'CA', flag: 'flag_ca'
    });
    mockCommonService.getMasterAllQualifications.and.returnValue(of({
      message: 'OK',
      result: [
        { id: 1, name: 'ECE' },
        { id: 2, name: 'IT' }
      ]
    }));
    mockCommonService.formatPhoneNumber.and.callFake((val: string) => val ? '123 456 7890' : '');
    mockCommonService.formatPostalCode.and.callFake((val: string) => val ? 'V5K 0A1' : '');

    mockTocService = jasmine.createSpyObj('TocRegistrationService', [
      'uploadImages',
      'updateTocUserDetail',
      'getTOCUserDetailByID',
      'GetAllDayCareWithInRadius',
      'getAllAreaOfExpertise',
      'hideProfileModal',
      'refreshTocSubject',
      'GetUserById',
      'getDocumentTypeList'
    ]);
    mockTocService.refresh$ = refreshSubject.asObservable();
    mockTocService.getAllAreaOfExpertise.and.returnValue(of({
      message: 'Success',
      result: [
        { id: 1, name: 'Infant Care', isActive: true },
        { id: 2, name: 'Toddler Care', isActive: false }
      ]
    }));
    mockTocService.GetUserById.and.returnValue(of({
      message: 'Success',
      result: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        expertise: '1,2'
      }
    }));
    mockTocService.getTOCUserDetailByID.and.returnValue(of({
      message: 'ok',
      result: {
        userMasterId: 101,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '123 456 7890',
        pincode: 'V5K 0A1',
        preferredArea: 'Vancouver',
        country: 'Canada',
        state: 'BC',
        city: 'Vancouver',
        message: 'Hello',
        experience: 3,
        qualification: '1',
        uploadedDocument: ['doc1.png'],
        uploadedDocumentType: [1],
        documentResumes: ['resume.pdf'],
        radius: 15,
        workingDays: '1,2'
      }
    }));
    mockTocService.getDocumentTypeList.and.returnValue(of({
      message: 'OK',
      result: [
        { id: 1, documentType: "Driver's License" },
        { id: 2, documentType: 'Resume' },
        { id: 3, documentType: 'ProfileImage' }
      ]
    }));

    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal'),
      val: jasmine.createSpy('val'),
      html: jasmine.createSpy('html'),
    });

    await TestBed.configureTestingModule({
      imports: [TOCRegistrationComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        DatePipe,
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: ToastrService, useValue: mockToastr },
        { provide: TocRegistrationService, useValue: mockTocService },
        { provide: CookieService, useValue: mockCookieService },
        { provide: CommonService, useValue: mockCommonService },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({}),
            params: of({})
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(TOCRegistrationComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(TOCRegistrationComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
    expect(component.TOCRegistration).toBeDefined();
    expect(component.TOCModalRegistration).toBeDefined();
  });

  describe('Custom Validators', () => {
    it('charOnlyValidator should validate only alphabets and spaces', () => {
      const validator = charOnlyValidator();
      const validControl = new FormControl('John Doe');
      const invalidControl = new FormControl('John123');

      expect(validator(validControl)).toBeNull();
      expect(validator(invalidControl)).toEqual({ charOnly: true });
    });

    it('commaSeparatedValidator should validate postal code format list or null', () => {
      const validator = commaSeparatedValidator();
      const emptyControl = new FormControl('');
      const validControl = new FormControl('V5K 0A1, V5K 0A2');
      const invalidControl = new FormControl('invalid');

      expect(validator(emptyControl)).toBeNull();
      expect(validator(validControl)).toBeNull();
      expect(validator(invalidControl)).toEqual({ commaSeparated: true });
    });
  });

  describe('ngOnInit and Initial State', () => {
    it('should initialize countries and call user and qualification fetch methods', fakeAsync(() => {
      spyOn(window, 'scrollTo');
      component.ngOnInit();
      tick(150);

      expect(component.countries.length).toBe(2);
      expect(component.selectedCountry).toEqual({ id: 1, name: 'Canada', code: 'CA', flag: 'flag_ca' });
      expect(component.UserID).toBe(101);
      expect(component.userRoleID).toBe(4);
      expect(mockTocService.GetUserById).toHaveBeenCalledWith(101);
      expect(mockCommonService.getMasterAllQualifications).toHaveBeenCalled();
      expect(mockTocService.getDocumentTypeList).toHaveBeenCalled();
      expect(mockTocService.getAllAreaOfExpertise).toHaveBeenCalled();
      expect(window.scrollTo).toHaveBeenCalled();
    }));

    it('should reload data when tocservice.refresh$ emits', () => {
      component.ngOnInit();
      spyOn(component, 'GetUserById');
      spyOn(component, 'getQualifications');
      spyOn(component, 'initDatePickers');
      spyOn(component, 'getDocumentTypeList');

      refreshSubject.next();

      expect(component.GetUserById).toHaveBeenCalledWith(101);
      expect(component.getQualifications).toHaveBeenCalled();
      expect(component.initDatePickers).toHaveBeenCalled();
      expect(component.getDocumentTypeList).toHaveBeenCalled();
    });
  });

  describe('Form Handling & Input Events', () => {
    it('should sanitize non-numeric characters in onExperienceInput', () => {
      const event = { target: { value: '5abc' } } as any;
      component.onExperienceInput(event);
      expect(component.TOCRegistration.get('experience')?.value).toBe('5');
    });

    it('should format mobile phone number on formatPhoneNumber', () => {
      const event = { target: { value: '1234567890' } } as any;
      component.formatPhoneNumber(event);
      expect(mockCommonService.formatPhoneNumber).toHaveBeenCalledWith('1234567890');
      expect(component.TOCRegistration.get('mobile')?.value).toBe('123 456 7890');
    });

    it('should format postal code on formatPostalCode', () => {
      const event = { target: { value: 'v5k0a1' } } as any;
      component.formatPostalCode(event);
      expect(mockCommonService.formatPostalCode).toHaveBeenCalledWith('v5k0a1');
      expect(component.TOCRegistration.get('pinCode')?.value).toBe('V5K 0A1');
    });

    it('should validate mobile number length in onEnterMobileNumber', () => {
      component.onEnterMobileNumber({ target: { value: '1234567890123' } });
      expect(component.IncorrectMobileNumberFormat).toBeTrue();

      component.onEnterMobileNumber({ target: { value: '123 456 7890' } });
      expect(component.IncorrectMobileNumberFormat).toBeFalse();
    });

    it('should toggle dropdown and select country', () => {
      expect(component.dropdownOpen).toBeFalse();
      component.toggleDropdown();
      expect(component.dropdownOpen).toBeTrue();

      const newCountry = { id: 2, name: 'USA' };
      component.selectCountry(newCountry);
      expect(component.selectedCountry).toEqual(newCountry);
    });
  });

  describe('File Handling', () => {
    it('should accept valid file extensions for resume in onFileChange', () => {
      const validFile = new File(['content'], 'resume.pdf', { type: 'application/pdf' });
      const event = { target: { files: [validFile] } };

      component.onFileChange(event);

      expect(component.selectedFile).toBe(validFile);
    });

    it('should show swal error for invalid file extension in onFileChange', () => {
      spyOn(Swal, 'fire');
      const invalidFile = new File(['content'], 'resume.exe', { type: 'application/x-msdownload' });
      const event = { target: { files: [invalidFile] } };

      component.onFileChange(event);

      expect(component.selectedFile).toBeNull();
      expect(Swal.fire).toHaveBeenCalled();
    });

    it('should accept valid document file in onFileChangeDocument', () => {
      const validFile = new File(['content'], 'id.png', { type: 'image/png' });
      const event = { target: { files: [validFile] } };

      component.onFileChangeDocument(event);

      expect(component.selectedFileDocument).toBe(validFile);
    });

    it('should accept valid educational document in onFileChangeEducationalDocument', () => {
      const validFile = new File(['content'], 'degree.jpg', { type: 'image/jpeg' });
      const event = { target: { files: [validFile] } };

      component.onFileChangeEducationalDocument(event);

      expect(component.selectedFileEducationalDocument).toBe(validFile);
    });

    it('should upload files using tocservice.uploadImages', async () => {
      component.selectedFile = new File(['test'], 'resume.pdf', { type: 'application/pdf' });
      mockTocService.uploadImages.and.returnValue(of({ message: 'OK', result: [{ path: 'http://s3/resume.pdf' }] }));

      const res = await component.UploadFiles();
      expect(mockTocService.uploadImages).toHaveBeenCalled();
      expect(res.message).toBe('OK');
    });

    it('should return undefined from UploadFiles if no file selected', async () => {
      component.selectedFile = null;
      const res = await component.UploadFiles();
      expect(res).toBeUndefined();
    });
  });

  describe('Working Days and Slot Management', () => {
    it('should add working day on checked change and remove on unchecked', () => {
      component.TOCRegistration.get('partTimeWorkingDays')?.setValue('');
      component.SelectedWeekDays = [];

      // Check Monday
      component.onWorkingDaysChange('Monday', { target: { checked: true } });
      expect(component.TOCRegistration.get('partTimeWorkingDays')?.value).toBe('1');
      expect(component.SelectedWeekDays).toContain('Monday');

      // Uncheck Monday
      component.onWorkingDaysChange('Monday', { target: { checked: false } });
      expect(component.TOCRegistration.get('partTimeWorkingDays')?.value).toBe('');
      expect(component.SelectedWeekDays).not.toContain('Monday');
    });

    it('should verify isChecked method accurately', () => {
      component.TOCRegistration.get('partTimeWorkingDays')?.setValue('1,2');
      expect(component.isChecked('Monday')).toBeTrue();
      expect(component.isChecked('Wednesday')).toBeFalse();
    });

    it('should open modal in onPlusClick', () => {
      const mockEvent = jasmine.createSpyObj('MouseEvent', ['stopPropagation']);
      component.onPlusClick('Monday', mockEvent);

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(component.SelectedDayForSlot).toBe('Monday');
      expect((window as any).$).toHaveBeenCalledWith('#TimeSlotModal2');
    });

    it('showmodal should warn when working days are empty and no previous details exist', () => {
      spyOn(Swal, 'fire');
      component.TOCUserDetail = null;
      component.TOCModalRegistration.patchValue({ partTimeStartDate: null });
      component.TOCRegistration.patchValue({ partTimeWorkingDays: '' });

      component.showmodal();

      expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
        icon: 'warning',
        title: 'Attention'
      }));
    });
  });

  describe('Nearby Daycares and Location Operations', () => {
    it('should call GetAllDayCareWithInRadius on GetAllDayCaresNearBy', () => {
      mockTocService.GetAllDayCareWithInRadius.and.returnValue(of({
        message: 'ok',
        result: [{ id: 1, centreName: 'Sunshine Daycare', centreEmail: 'sun@dc.com', centreMobile: '123' }]
      }));

      component.GetAllDayCaresNearBy({ target: { value: 10 } });

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(mockTocService.GetAllDayCareWithInRadius).toHaveBeenCalledWith(0, 0, 10);
      expect(component.NearbyDayCareList.length).toBe(1);
      expect(mockSpinner.hide).toHaveBeenCalled();
    });

    it('should filter nearby daycares with search term', () => {
      component.DayCaresForFilters = [
        { id: 1, centreName: 'Alpha Daycare', centreEmail: 'alpha@test.com', centreMobile: '111' },
        { id: 2, centreName: 'Beta Daycare', centreEmail: 'beta@test.com', centreMobile: '222' }
      ];

      component.searchTerm = 'alpha';
      component.filterNearbyDaycares();

      expect(component.NearbyDayCareList.length).toBe(1);
      expect(component.NearbyDayCareList[0].id).toBe(1);
    });

    it('should apply and toggle particular daycare selection', () => {
      component.applyforParticularDC({ target: { checked: true } }, 5);
      expect(component.selectedDayCareIds).toContain(5);

      component.applyforParticularDC({ target: { checked: false } }, 5);
      expect(component.selectedDayCareIds).not.toContain(5);
    });

    it('should apply all daycares on applyforAllDC', () => {
      component.NearbyDayCareList = [{ id: 10 }, { id: 20 }];
      component.applyforAllDC({ target: { checked: true } });
      expect(component.selectedDayCareIds).toEqual([10, 20]);

      component.applyforAllDC({ target: { checked: false } });
      expect(component.selectedDayCareIds).toEqual([]);
    });

    it('should update ContentP on onPageChange', () => {
      component.onPageChange(3);
      expect(component.ContentP).toBe(3);
    });
  });

  describe('Reset and Helper Methods', () => {
    it('should reset form state cleanly on resetForm', () => {
      component.resetForm();
      expect(component.TOCRegistration.get('id')?.value).toBe(0);
      expect(component.selectedFile).toBeNull();
      expect(component.selectedFileDocument).toBeNull();
      expect(component.selectedDayCareIds).toEqual([]);
    });

    it('should parse images in getAllImages', () => {
      expect(component.getAllImages('img1.png,img2.png')).toEqual(['img1.png', 'img2.png']);
      expect(component.getAllImages('')).toEqual([]);
    });

    it('should group records by section in groupBySection', () => {
      const records = [
        { section: 'Header', text: 'Welcome' },
        { section: 'Header', text: 'Subtitle' },
        { section: 'Body', text: 'Content' }
      ];
      const grouped = component.groupBySection(records);
      expect(grouped['Header'].length).toBe(2);
      expect(grouped['Body'].length).toBe(1);
    });
  });
});
