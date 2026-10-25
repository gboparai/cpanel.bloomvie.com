import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SocialLinksComponent } from './social-links.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { CommonService } from '../../../common-component/common.service';
import { OnboardingService } from '../../../onboarding/onboarding.service';
import { SocialLinksService } from './social-links.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

describe('SocialLinksComponent', () => {
  let component: SocialLinksComponent;
  let fixture: ComponentFixture<SocialLinksComponent>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockRouter: any;
  let mockCookie: jasmine.SpyObj<CookieService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockOnboardingService: any;
  let mockSocialLinksService: jasmine.SpyObj<SocialLinksService>;

  beforeEach(async () => {
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'warning', 'error', 'info']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockRouter = { url: '/settings/social-links', navigate: jasmine.createSpy('navigate') };
    mockCookie = jasmine.createSpyObj('CookieService', ['get', 'set', 'check', 'delete']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['decrypt', 'manageDaycareOnBoarding']);
    mockOnboardingService = {
      onBoardingData: { isCompleteStep7: false },
      handleNext: jasmine.createSpy('handleNext'),
      getCurrentTab: jasmine.createSpy('getCurrentTab'),
    };
    mockSocialLinksService = jasmine.createSpyObj('SocialLinksService', [
      'getSocialMediaLinks',
      'manageDaycareSocailLinks',
      'managePayrollFrequency',
      'getPayrollFrequencyByDaycareID',
    ]);

    mockSocialLinksService.getSocialMediaLinks.and.returnValue(
      of({
        message: 'Success',
        result: {
          id: 1,
          twitter: 'https://twitter.com/test',
          instagram: 'https://instagram.com/test',
          facebook: 'https://facebook.com/test',
          linkedIn: 'https://linkedin.com/test',
        },
      })
    );

    mockSocialLinksService.getPayrollFrequencyByDaycareID.and.returnValue(
      of({
        message: 'Success',
        result: { payrollFrequency: 'Monthly' },
      })
    );

    await TestBed.configureTestingModule({
      imports: [SocialLinksComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: ToastrService, useValue: mockToastr },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: Router, useValue: mockRouter },
        { provide: CookieService, useValue: mockCookie },
        { provide: CommonService, useValue: mockCommonService },
        { provide: OnboardingService, useValue: mockOnboardingService },
        { provide: SocialLinksService, useValue: mockSocialLinksService },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap({ enc_id: 'encrypted123' })),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(SocialLinksComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(SocialLinksComponent);
    component = fixture.componentInstance;
  });

  it('should create and initialize default properties', () => {
    expect(component).toBeTruthy();
    expect(component.socialLinksForm).toBeDefined();
    expect(component.payrollFrequencyForm).toBeDefined();
    expect(component.payrollFrequencies).toEqual(['Weekly', 'BiWeekly', 'Monthly']);
    expect(component.socialLinksFormControls).toBe(component.socialLinksForm.controls);
  });

  describe('ngOnInit', () => {
    it('should decrypt enc_id and set onboarding mode when enc_id is present', () => {
      mockCommonService.decrypt.and.returnValue('42');
      mockCookie.check.and.returnValue(true);
      mockCookie.get.and.returnValue('101');

      component.ngOnInit();

      expect(mockCommonService.decrypt).toHaveBeenCalledWith('encrypted123');
      expect(component.IsOnboarding).toBeFalse(); // url does not include onboarding
      expect(mockSocialLinksService.getSocialMediaLinks).toHaveBeenCalledWith(42);
    });

    it('should set onboarding mode true when router url includes onboarding', () => {
      mockRouter.url = '/onboarding/step-7';
      mockCommonService.decrypt.and.returnValue('42');

      component.ngOnInit();

      expect(component.IsOnboarding).toBeTrue();
    });

    it('should read from cookies when enc_id is not present', () => {
      TestBed.resetTestingModule();
      mockCookie.get.and.callFake((key: string) => {
        if (key === 'UserId') return '101';
        if (key === 'CentreID') return '99';
        return '';
      });

      TestBed.configureTestingModule({
        imports: [SocialLinksComponent, ReactiveFormsModule],
        providers: [
          FormBuilder,
          { provide: ToastrService, useValue: mockToastr },
          { provide: NgxSpinnerService, useValue: mockSpinner },
          { provide: Router, useValue: mockRouter },
          { provide: CookieService, useValue: mockCookie },
          { provide: CommonService, useValue: mockCommonService },
          { provide: OnboardingService, useValue: mockOnboardingService },
          { provide: SocialLinksService, useValue: mockSocialLinksService },
          {
            provide: ActivatedRoute,
            useValue: {
              queryParamMap: of(convertToParamMap({})),
            },
          },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      })
        .overrideComponent(SocialLinksComponent, {
          set: {
            imports: [ReactiveFormsModule],
            schemas: [NO_ERRORS_SCHEMA],
          },
        })
        .compileComponents();

      const newFixture = TestBed.createComponent(SocialLinksComponent);
      const newComp = newFixture.componentInstance;
      newComp.ngOnInit();

      expect(newComp.IsOnboarding).toBeFalse();
      expect(mockSocialLinksService.getPayrollFrequencyByDaycareID).toHaveBeenCalledWith(99);
    });
  });

  describe('getSocialMediaLinks', () => {
    it('should patch socialLinksForm on success and hide spinner after delay', fakeAsync(() => {
      component.getSocialMediaLinks();

      expect(component.socialLinksForm.value.twitter).toBe('https://twitter.com/test');
      expect(component.socialLinksForm.value.instagram).toBe('https://instagram.com/test');

      tick(300);
      expect(mockSpinner.hide).toHaveBeenCalled();
    }));
  });

  describe('getTrackValue', () => {
    it('should enable feature when form is valid', () => {
      component.socialLinksForm.patchValue({ twitter: 'valid' });
      component.getTrackValue();
      expect(component.disableFeature).toBeFalse();
    });
  });

  describe('onSubmitLinks', () => {
    it('should mark all controls as touched if form is invalid', () => {
      spyOn(component.socialLinksForm, 'markAllAsTouched');
      spyOnProperty(component.socialLinksForm, 'valid', 'get').and.returnValue(false);

      component.onSubmitLinks();

      expect(component.socialLinksForm.markAllAsTouched).toHaveBeenCalled();
    });

    it('should complete onboarding step 7 if all links are null and step7 not complete', () => {
      component.socialLinksForm.patchValue({
        facebook: null,
        instagram: null,
        linkedIn: null,
        twitter: null,
      });

      mockCommonService.manageDaycareOnBoarding.and.returnValue(
        of({ message: 'Success', activity: 'Skipped links' })
      );

      mockOnboardingService.onBoardingData.isCompleteStep7 = false;
      component.onSubmitLinks();

      expect(mockCommonService.manageDaycareOnBoarding).toHaveBeenCalled();
      expect(mockOnboardingService.onBoardingData.isCompleteStep7).toBeTrue();
      expect(mockOnboardingService.handleNext).toHaveBeenCalledWith('Tab-7');
    });

    it('should show success toastr if all links null and step7 was already completed', () => {
      component.socialLinksForm.patchValue({
        facebook: null,
        instagram: null,
        linkedIn: null,
        twitter: null,
      });

      mockCommonService.manageDaycareOnBoarding.and.returnValue(
        of({ message: 'Success', activity: 'Links already set' })
      );

      mockOnboardingService.onBoardingData.isCompleteStep7 = true;
      component.onSubmitLinks();

      expect(mockToastr.success).toHaveBeenCalledWith('Links already set');
      expect(mockOnboardingService.getCurrentTab).toHaveBeenCalled();
    });

    it('should update existing social links when activity includes updated', fakeAsync(() => {
      component.socialLinksForm.patchValue({
        facebook: 'http://facebook.com/test',
      });

      mockSocialLinksService.manageDaycareSocailLinks.and.returnValue(
        of({ message: 'Success', activity: 'Social links updated successfully' })
      );

      component.onSubmitLinks();

      expect(mockToastr.success).toHaveBeenCalledWith('Social links updated successfully');
      expect(mockSocialLinksService.getSocialMediaLinks).toHaveBeenCalled();
      tick(300);
      expect(mockSpinner.hide).toHaveBeenCalled();
    }));

    it('should handle warning response from manageDaycareSocailLinks', fakeAsync(() => {
      component.socialLinksForm.patchValue({
        facebook: 'http://facebook.com/test',
      });

      mockSocialLinksService.manageDaycareSocailLinks.and.returnValue(
        of({ message: 'Validation Failed', activity: '' })
      );

      component.onSubmitLinks();

      expect(mockToastr.warning).toHaveBeenCalledWith('Validation Failed');
      tick(300);
      expect(mockSpinner.hide).toHaveBeenCalled();
    }));

    it('should handle error from manageDaycareSocailLinks', () => {
      component.socialLinksForm.patchValue({
        facebook: 'http://facebook.com/test',
      });

      mockSocialLinksService.manageDaycareSocailLinks.and.returnValue(
        throwError(() => new Error('Server error'))
      );

      component.onSubmitLinks();

      expect(mockToastr.error).toHaveBeenCalledWith('Server error');
      expect(mockSpinner.hide).toHaveBeenCalled();
    });
  });

  describe('submitForm (payroll frequency)', () => {
    it('should save payroll frequency successfully when message is OK', () => {
      component.payrollFrequencyForm.patchValue({ payrollFrequency: 'Weekly' });
      mockSocialLinksService.managePayrollFrequency.and.returnValue(of({ message: 'OK' }));

      component.submitForm();

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(component.isPayrollFilled).toBeTrue();
      expect(mockToastr.success).toHaveBeenCalledWith('Payroll Frequency Saved Successfully');
      expect(mockSpinner.hide).toHaveBeenCalled();
    });

    it('should warn when response is not OK', () => {
      component.payrollFrequencyForm.patchValue({ payrollFrequency: 'Weekly' });
      mockSocialLinksService.managePayrollFrequency.and.returnValue(of({ message: 'Failed' }));

      component.submitForm();

      expect(component.isPayrollFilled).toBeFalse();
      expect(mockToastr.warning).toHaveBeenCalledWith('Unexpected response');
    });

    it('should handle error when managePayrollFrequency fails', () => {
      component.payrollFrequencyForm.patchValue({ payrollFrequency: 'Weekly' });
      mockSocialLinksService.managePayrollFrequency.and.returnValue(
        throwError(() => new Error('Network error'))
      );

      component.submitForm();

      expect(mockToastr.error).toHaveBeenCalledWith('An error occurred while processing the request');
      expect(mockSpinner.hide).toHaveBeenCalled();
    });

    it('should mark payrollFrequencyForm as touched if invalid', () => {
      spyOn(component.payrollFrequencyForm, 'markAllAsTouched');
      spyOnProperty(component.payrollFrequencyForm, 'valid', 'get').and.returnValue(false);

      component.submitForm();

      expect(component.payrollFrequencyForm.markAllAsTouched).toHaveBeenCalled();
      expect(mockSpinner.hide).toHaveBeenCalled();
    });
  });
});
