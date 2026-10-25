import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OnboardingComponent } from './onboarding.component';
import { OnboardingService } from './onboarding.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { CommonService } from '../common-component/common.service';
import { CookieService } from 'ngx-cookie-service';
import { ProfileService } from '../common-component/profile/profile.service';
import { LoginService } from '../login/login.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError, BehaviorSubject } from 'rxjs';

describe('OnboardingComponent', () => {
  let component: OnboardingComponent;
  let fixture: ComponentFixture<OnboardingComponent>;
  let mockOnboardingService: any;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockProfileService: jasmine.SpyObj<ProfileService>;
  let mockLoginService: any;

  let queryParamMapSubject: BehaviorSubject<any>;

  beforeEach(async () => {
    queryParamMapSubject = new BehaviorSubject(convertToParamMap({ enc_id: 'enc-15' }));
    mockOnboardingService = {
      isOnboarding: false,
      onBoardingData: null,
      getCurrentTab: jasmine.createSpy('getCurrentTab'),
      getDayCareOnBoardingCurrentTab: jasmine.createSpy('getDayCareOnBoardingCurrentTab').and.returnValue(
        of({ message: 'Success', result: { step: 1 } })
      ),
    };

    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['decrypt']);
    mockCookieService = jasmine.createSpyObj('CookieService', ['check', 'get']);
    mockProfileService = jasmine.createSpyObj('ProfileService', ['getSubscriptionPlanByUserId']);

    mockLoginService = {
      authData: {
        centreId: 10,
        userId: 100,
        userRoleId: 3,
      },
    };

    mockCommonService.decrypt.and.callFake((val: string) => (val === 'enc-15' ? '15' : ''));
    mockCookieService.check.and.returnValue(true);
    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'UserId') return '50';
      if (key === 'userRoleID') return '3';
      return '';
    });
    mockProfileService.getSubscriptionPlanByUserId.and.returnValue(
      of({ message: 'OK', result: [{ planName: 'Standard Plan' }] })
    );

    await TestBed.configureTestingModule({
      imports: [OnboardingComponent],
      providers: [
        { provide: OnboardingService, useValue: mockOnboardingService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: ToastrService, useValue: mockToastr },
        { provide: CommonService, useValue: mockCommonService },
        { provide: CookieService, useValue: mockCookieService },
        { provide: ProfileService, useValue: mockProfileService },
        { provide: LoginService, useValue: mockLoginService },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: queryParamMapSubject.asObservable(),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(OnboardingComponent, {
        set: {
          imports: [],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(OnboardingComponent);
    component = fixture.componentInstance;
  });

  it('should create the OnboardingComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit & Param Handling', () => {
    it('should decrypt enc_id and load onboarding tab and plan details', () => {
      component.ngOnInit();

      expect(mockOnboardingService.isOnboarding).toBeTrue();
      expect(component.dayCareID).toBe(15);
      expect(mockOnboardingService.getDayCareOnBoardingCurrentTab).toHaveBeenCalledWith(15);
      expect(mockOnboardingService.getCurrentTab).toHaveBeenCalled();
      expect(component.planName).toBe('Standard Plan');
    });

    it('should fallback to authData when enc_id is not in query params', () => {
      queryParamMapSubject.next(convertToParamMap({}));

      component.ngOnInit();

      expect(component.dayCareID).toBe(10);
    });
  });

  describe('ngOnDestroy', () => {
    it('should set isOnboarding to false on destroy', () => {
      component.ngOnDestroy();
      expect(mockOnboardingService.isOnboarding).toBeFalse();
    });
  });

  describe('Service Calls', () => {
    it('should handle getDayCareOnBoardingCurrentTab error', () => {
      mockOnboardingService.getDayCareOnBoardingCurrentTab.and.returnValue(
        throwError(() => new Error('Failed'))
      );

      component.dayCareID = 15;
      component.getDayCareOnBoardingCurrentTab();

      expect(mockSpinner.hide).toHaveBeenCalled();
    });

    it('should handle getPlanDetail non-OK response', () => {
      mockProfileService.getSubscriptionPlanByUserId.and.returnValue(of({ message: 'Error' }));

      component.getPlanDetail();

      expect(mockSpinner.hide).toHaveBeenCalled();
      expect(component.planName).toBe('');
    });
  });
});
