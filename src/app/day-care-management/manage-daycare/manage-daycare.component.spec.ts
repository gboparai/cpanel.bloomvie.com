import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ManageDaycareComponent } from './manage-daycare.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonService } from '../../common-component/common.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ProfileService } from '../../common-component/profile/profile.service';
import { ManageDaycareService } from './manage-daycare.service';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { OnboardingService } from '../../onboarding/onboarding.service';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

describe('ManageDaycareComponent', () => {
  let component: ManageDaycareComponent;
  let fixture: ComponentFixture<ManageDaycareComponent>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockProfileService: jasmine.SpyObj<ProfileService>;
  let mockManageDaycareService: jasmine.SpyObj<ManageDaycareService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockCookie: jasmine.SpyObj<CookieService>;
  let mockOnboardingService: any;

  beforeEach(async () => {
    mockCommonService = jasmine.createSpyObj('CommonService', [
      'getCountriesFlag',
      'getDefaultCountryFlag',
      'decrypt',
      'encrypt',
      'convertS3File',
      'uploadImages',
      'updateHeaderImage',
      'updateTriggerLogoSignal',
      'formatPostalCode',
    ]);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockProfileService = jasmine.createSpyObj('ProfileService', ['GetUserById']);
    mockManageDaycareService = jasmine.createSpyObj('ManageDaycareService', [
      'getDayCareByCentreAdminID',
      'manageDayCare',
    ]);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'warning', 'error', 'info']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockCookie = jasmine.createSpyObj('CookieService', ['get', 'check']);

    mockOnboardingService = {
      connectedAccountId: signal(''),
      isOnboardedAccount: signal(false),
      stripeOnboardingUrl: signal(''),
      isOnboarding: true,
      onBoardingData: { isCompleteStep1: false },
      handleNext: jasmine.createSpy('handleNext'),
      getCurrentTab: jasmine.createSpy('getCurrentTab'),
    };

    mockCommonService.getCountriesFlag.and.returnValue([{ id: 1, name: 'Canada', code: 'CA', flag: 'flag' }, { id: 2, name: 'USA', code: 'US', flag: 'flag' }]);
    mockCommonService.getDefaultCountryFlag.and.returnValue({ id: 1, name: 'Canada', code: 'CA', flag: 'flag' });
    mockCookie.get.and.returnValue('');
    mockCookie.check.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [ManageDaycareComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        DatePipe,
        { provide: CommonService, useValue: mockCommonService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: ProfileService, useValue: mockProfileService },
        { provide: ManageDaycareService, useValue: mockManageDaycareService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: Router, useValue: mockRouter },
        { provide: CookieService, useValue: mockCookie },
        { provide: OnboardingService, useValue: mockOnboardingService },
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
      .overrideComponent(ManageDaycareComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    // Create a dummy #dob element in body for flatpickr in ngAfterViewInit
    let dobElem = document.getElementById('dob');
    if (!dobElem) {
      dobElem = document.createElement('input');
      dobElem.id = 'dob';
      (dobElem as any).flatpickr = jasmine.createSpy('flatpickr');
      document.body.appendChild(dobElem);
    } else {
      (dobElem as any).flatpickr = jasmine.createSpy('flatpickr');
    }

    fixture = TestBed.createComponent(ManageDaycareComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    const dobElem = document.getElementById('dob');
    if (dobElem && dobElem.parentNode) {
      dobElem.parentNode.removeChild(dobElem);
    }
  });

  it('should create the ManageDaycareComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization and Forms', () => {
    it('should initialize centre form and admin form controls', () => {
      expect(component.centreFormControls.centreName).toBeDefined();
      expect(component.adminFormControls.firstName).toBeDefined();
      expect(component.form.valid).toBeFalse();
      expect(component.adminForm.valid).toBeFalse();
    });

    it('should patch login user id if cookie exists', () => {
      mockCookie.check.and.callFake((key: string) => key === 'UserId');
      mockCookie.get.and.callFake((key: string) => (key === 'UserId' ? '55' : ''));

      component.patchLoginLoginUserID();

      expect(component.loginUserID).toBe(55);
      expect(component.form.get('loginUserID').value).toBe(55);
    });

    it('should initialize flags and fetch daycare on ngOnInit when UserId is set', () => {
      mockCookie.get.and.callFake((k: string) => {
        if (k === 'UserRoleId') return '3';
        if (k === 'UserId') return '12';
        return '';
      });
      spyOn(component, 'getDayCareByCentreAdminID');
      spyOn(component, 'getUserDetailByUserID');

      component.ngOnInit();

      expect(component.UserId).toBe(12);
      expect(component.getDayCareByCentreAdminID).toHaveBeenCalled();
      expect(component.getUserDetailByUserID).toHaveBeenCalled();
    });

    it('should parse query parameters when UserId is not from cookie', () => {
      mockCookie.get.and.returnValue('1'); // Super admin role
      const route = TestBed.inject(ActivatedRoute);
      (route.snapshot.queryParamMap.get as jasmine.Spy).and.callFake((param: string) => {
        if (param === 'enc_id') return 'enc123';
        if (param === 'enc_edit_dcc') return 'true';
        if (param === 'centreAdminID') return 'encAdmin';
        return null;
      });
      mockCommonService.decrypt.and.callFake((val: string) => {
        if (val === 'enc123') return '101';
        if (val === 'encAdmin') return '202';
        return '';
      });
      spyOn(component, 'getDayCareByCentreAdminID');

      component.ngOnInit();

      expect(component.case).toBe('update');
      expect(component.dayCareID).toBe(101);
      expect(component.UserId).toBe(202);
      expect(component.getDayCareByCentreAdminID).toHaveBeenCalled();
    });
  });

  describe('ngAfterViewInit', () => {
    it('should initialize flatpickr on dob element', () => {
      const dobElem = document.getElementById('dob');
      component.ngAfterViewInit();
      expect((dobElem as any).flatpickr).toHaveBeenCalled();
    });
  });

  describe('Phone and Postal code formatting', () => {
    it('should format phone number correctly', () => {
      const event = { target: { value: '1234567890' } };
      component.formatPhoneNumber(event);
      expect(event.target.value).toBe('123 456 7890');
      expect(component.adminForm.controls['mobile'].value).toBe('123 456 7890');
    });

    it('should format postal code for centre and admin', () => {
      mockCommonService.formatPostalCode.and.returnValue('K1A 0B1');
      const event = { target: { value: 'k1a0b1' } };

      component.formatPostalCode(event, 'centre');
      expect(component.form.controls['pinCode'].value).toBe('K1A 0B1');

      component.formatPostalCode(event, 'admin');
      expect(component.adminForm.controls['pinCode'].value).toBe('K1A 0B1');
    });

    it('should prevent non-numeric key press', () => {
      const eventPrevent = new KeyboardEvent('keypress', { key: 'a' });
      spyOn(eventPrevent, 'preventDefault');
      component.allowOnlyNumericInput(eventPrevent);
      expect(eventPrevent.preventDefault).toHaveBeenCalled();

      const eventAllow = new KeyboardEvent('keypress', { key: '5' });
      spyOn(eventAllow, 'preventDefault');
      component.allowOnlyNumericInput(eventAllow);
      expect(eventAllow.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('getUserDetailByUserID', () => {
    it('should fetch user details and patch adminForm', () => {
      component.UserIdBYFrontend = 5;
      mockCookie.get.and.returnValue('3');
      mockProfileService.GetUserById.and.returnValue(of({
        message: 'Success',
        result: {
          id: 5,
          firstName: 'Jane',
          middleName: 'M',
          lastName: 'Doe',
          email: 'jane@example.com',
        },
      }));

      component.getUserDetailByUserID();

      expect(mockProfileService.GetUserById).toHaveBeenCalledWith(5, '3');
      expect(component.adminForm.get('firstName').value).toBe('Jane M Doe');
      expect(component.adminFormControls.firstName.disabled).toBeTrue();
      expect(component.adminFormControls.email.disabled).toBeTrue();
    });

    it('should enable controls when service returns message other than Success', () => {
      component.UserIdBYFrontend = 5;
      mockProfileService.GetUserById.and.returnValue(of({ message: 'Error' } as any));

      component.getUserDetailByUserID();

      expect(component.adminFormControls.firstName.enabled).toBeTrue();
      expect(component.adminFormControls.email.enabled).toBeTrue();
    });
  });

  describe('getDayCareByCentreAdminID', () => {
    it('should return early if UserId is not set', () => {
      component.UserId = 0;
      component.getDayCareByCentreAdminID();
      expect(mockManageDaycareService.getDayCareByCentreAdminID).not.toHaveBeenCalled();
    });

    it('should patch forms with response data when OK', () => {
      component.UserId = 10;
      const mockResult = [{
        id: 101,
        centreName: 'Sunrise Daycare',
        centreAddress: '123 Main St',
        centreCountry: 'Canada',
        centreState: 'Ontario',
        centreCity: 'Toronto',
        centreDescription: 'Best daycare',
        centrePinCode: 'M5V 2T6',
        centerLogoPath: 'path/logo.png',
        centerLogo: 'logo.png',
        documentPath: 'path/doc.pdf',
        documentName: 'doc.pdf',
        centreLogos3: 's3/logo.png',
        adminProfileS3: 's3/profile.png',
        firstName: 'Alice',
        email: 'alice@example.com',
        mobile: '123 456 7890',
        address: '456 Side St',
        country: 'Canada',
        state: 'Ontario',
        city: 'Toronto',
        pinCode: 'M5V 2T6',
        dob: '1990-01-01',
        adminProfilePath: 'path/prof.png',
        adminProfile: 'prof.png',
      }];
      mockManageDaycareService.getDayCareByCentreAdminID.and.returnValue(of({
        message: 'OK',
        result: mockResult,
      }));
      mockCommonService.convertS3File.and.callFake((val) => 'converted/' + val);

      component.getDayCareByCentreAdminID();

      expect(component.form.get('centreName').value).toBe('Sunrise Daycare');
      expect(component.adminForm.get('firstName').value).toBe('Alice');
      expect(component.readFiles.document).toBe('assets/img/pdf-logo.png');
    });
  });

  describe('File Handling', () => {
    it('should reject non-image file on onFileChange', async () => {
      spyOn(Swal, 'fire');
      const event = { target: { files: [{ type: 'text/plain' }] } };

      await component.onFileChange(true, event);

      expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({ icon: 'error' }));
    });

    it('should reject non-pdf file on onSelectDocument', async () => {
      spyOn(Swal, 'fire');
      const event = { target: { files: [{ type: 'image/png' }] } };

      await component.onSelectDocument(event);

      expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({ icon: 'error' }));
    });

    it('should accept pdf file on onSelectDocument', async () => {
      const dummyPdf = new File(['dummy'], 'doc.pdf', { type: 'application/pdf' });
      const event = { target: { files: [dummyPdf] } };

      await component.onSelectDocument(event);

      expect(component.readFiles.document).toBe('assets/img/pdf-logo.png');
    });
  });

  describe('Form Validation and Submission', () => {
    it('should validate form fields and files correctly in validateForms', () => {
      component.form.patchValue({ id: 0 });
      expect(component.validateForms()).toBeFalse();
    });

    it('should upload files and call DCC api on manageCentre', async () => {
      spyOn(component, 'validateForms').and.returnValue(true);
      spyOn(component, 'UploadFiles').and.returnValue(Promise.resolve({
        message: 'OK',
        result: [
          { type: 'Logos', path: 'p1', imageName: 'img1' },
          { type: 'Profile_Image', path: 'p2', imageName: 'img2' },
          { type: 'Centre_Documents', path: 'p3', imageName: 'img3' },
        ],
      }));
      spyOn(component, 'callManageDCCApi');

      (component as any).files = {
        centreLogo: new File([''], 'logo.png'),
        profile: new File([''], 'prof.png'),
        document: new File([''], 'doc.pdf'),
      };

      await component.manageCentre();

      expect(component.UploadFiles).toHaveBeenCalled();
      expect(component.callManageDCCApi).toHaveBeenCalled();
    });

    it('should handle callManageDCCApi success during onboarding', fakeAsync(() => {
      component.adminForm.get('dob').setValue('01/15/1995');
      mockManageDaycareService.manageDayCare.and.returnValue(of({
        message: 'Success',
        activity: 'Daycare saved',
        result: {
          centreId: 88,
          onBoardingLink: 'https://stripe.com',
          connectedAccountId: 'acc_123',
          isOnboarded: false,
        },
      }));

      component.callManageDCCApi();
      tick(350);

      expect(mockCommonService.updateHeaderImage).toHaveBeenCalled();
      expect(mockOnboardingService.handleNext).toHaveBeenCalledWith('Tab-1');
    }));

    it('should handle callManageDCCApi error', fakeAsync(() => {
      component.adminForm.get('dob').setValue('01/15/1995');
      mockManageDaycareService.manageDayCare.and.returnValue(throwError(() => ({ message: 'API Failed' })));

      component.callManageDCCApi();
      tick(350);

      expect(mockToastr.error).toHaveBeenCalledWith('API Failed');
    }));
  });

  describe('Dropdown and Country Selection', () => {
    it('should toggle dropdown and select country', () => {
      expect(component.dropdownOpen).toBeFalse();
      component.toggleDropdown();
      expect(component.dropdownOpen).toBeTrue();

      component.selectCountry({ name: 'USA' });
      expect(component.selectedCountry).toEqual({ name: 'USA' });
      expect(component.dropdownOpen).toBeTrue();
    });
  });
});
