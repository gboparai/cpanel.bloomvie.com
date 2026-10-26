import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { ProfileService } from './profile.service';
import { CookieService } from 'ngx-cookie-service';
import { UserRoleService } from '../../settings/Permission/user-role/user-role.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApplicationsSettingsService } from '../../settings/application-settings/applications-settings/applications-settings.service';
import { Router } from '@angular/router';
import { TocViewService } from '../../toc-view/toc-view.service';
import { TocRegistrationService } from '../../toc-registration/toc-registration.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { HeaderServiceService } from '../../layout/header/header-service.service';
import { ChildParentService } from '../../parent-management/parent-onboarding/child-parent-details/child-parent.service';
import { DatePipe } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { DayCareDashboardService } from '../../day-care-management/daycare-dashboard/day-care-dashboard.service';
import { CommonService } from '../common.service';
import { ChangeDetectorRef, NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { of, Subject } from 'rxjs';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  let mockProfileService: jasmine.SpyObj<ProfileService>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockRoleService: jasmine.SpyObj<UserRoleService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockAppService: jasmine.SpyObj<ApplicationsSettingsService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockTocService: jasmine.SpyObj<TocViewService>;
  let mockTocRegistrationService: any;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockHeaderService: any;
  let mockChildParentService: jasmine.SpyObj<ChildParentService>;
  let mockDatePipe: jasmine.SpyObj<DatePipe>;
  let mockSanitizer: jasmine.SpyObj<DomSanitizer>;
  let mockDayCareDashboard: jasmine.SpyObj<DayCareDashboardService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;

  beforeEach(async () => {
    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal'),
      val: jasmine.createSpy('val')
    });

    mockProfileService = jasmine.createSpyObj('ProfileService', [
      'GetUserById',
      'ManageUser',
      'ManageMasterDocument',
      'GetMasterDocumentbyId',
      'getSubscriptionPlanByUserId',
      'getTOCUserCentreListById'
    ]);
    mockProfileService.GetUserById.and.returnValue(of({
      message: 'OK',
      result: {
        id: 101,
        firstName: 'Jane',
        middleName: 'M',
        lastName: 'Doe',
        email: 'jane@example.com',
        mobile: '123 456 7890',
        address: '100 Main St',
        gender: 'F',
        dob: '1995-05-15',
        userRoleID: 3
      }
    }));
    mockProfileService.ManageUser.and.returnValue(of({ message: 'Success' }));
    mockProfileService.ManageMasterDocument.and.returnValue(of({ message: 'Success' }));
    mockProfileService.GetMasterDocumentbyId.and.returnValue(of({
      message: 'Success',
      result: [{ documentImage: 'img.png', documentImagePath: 'path/' }]
    }));
    mockProfileService.getSubscriptionPlanByUserId.and.returnValue(of({
      message: 'Success',
      result: [{ planName: 'Standard Plan' }]
    }));
    mockProfileService.getTOCUserCentreListById.and.returnValue(of({
      message: 'Success',
      result: []
    }));

    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'set', 'delete', 'check']);
    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'UserId') return '101';
      if (key === 'userRoleID' || key === 'UserRoleId') return '3';
      if (key === 'CentreID') return '10';
      return '';
    });

    mockRoleService = jasmine.createSpyObj('UserRoleService', ['getUserRoleList']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);

    mockAppService = jasmine.createSpyObj('ApplicationsSettingsService', ['GetApplicationSetting']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockTocService = jasmine.createSpyObj('TocViewService', ['getQualifications', 'getDocumentTypeList', 'getAppliedJobTOByID']);
    mockTocService.getQualifications.and.returnValue(of({ message: 'ok', result: [] }));
    mockTocService.getDocumentTypeList.and.returnValue(of({ message: 'ok', result: [] }));
    mockTocService.getAppliedJobTOByID.and.returnValue(of({ message: 'ok', result: [] }));

    mockTocRegistrationService = {
      hideModal$: new Subject(),
      getTOCUserDetailByID: jasmine.createSpy().and.returnValue(of({ message: 'ok', result: {} }))
    };

    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);

    mockHeaderService = {
      switchProfile: signal(0)
    };

    mockChildParentService = jasmine.createSpyObj('ChildParentService', ['getChildList']);
    mockDatePipe = jasmine.createSpyObj('DatePipe', ['transform']);
    mockDatePipe.transform.and.returnValue('2026-05-15');

    mockSanitizer = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustResourceUrl']);
    mockSanitizer.bypassSecurityTrustResourceUrl.and.callFake((url: string) => url as any);

    mockDayCareDashboard = jasmine.createSpyObj('DayCareDashboardService', ['getDayCareByID']);

    mockCommonService = jasmine.createSpyObj('CommonService', [
      'getCountriesFlag',
      'getDefaultCountryFlag',
      'convertS3File',
      'base64ToBlobUrl',
      'uploadImages'
    ]);
    mockCommonService.getCountriesFlag.and.returnValue([{ id: 1, name: 'Canada' }] as any);
    mockCommonService.getDefaultCountryFlag.and.returnValue({ id: 1, name: 'Canada' } as any);
    mockCommonService.convertS3File.and.returnValue('data:image/png...');
    mockCommonService.base64ToBlobUrl.and.returnValue('blob:http://localhost/test');

    await TestBed.configureTestingModule({
      imports: [ProfileComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        ChangeDetectorRef,
        { provide: ProfileService, useValue: mockProfileService },
        { provide: CookieService, useValue: mockCookieService },
        { provide: UserRoleService, useValue: mockRoleService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: ApplicationsSettingsService, useValue: mockAppService },
        { provide: Router, useValue: mockRouter },
        { provide: TocViewService, useValue: mockTocService },
        { provide: TocRegistrationService, useValue: mockTocRegistrationService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: HeaderServiceService, useValue: mockHeaderService },
        { provide: ChildParentService, useValue: mockChildParentService },
        { provide: DatePipe, useValue: mockDatePipe },
        { provide: DomSanitizer, useValue: mockSanitizer },
        { provide: DayCareDashboardService, useValue: mockDayCareDashboard },
        { provide: CommonService, useValue: mockCommonService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(ProfileComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create the ProfileComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize profileform and imageForm controls', () => {
      expect(component.profileform).toBeDefined();
      expect(component.profileform.get('firstName')).toBeDefined();
      expect(component.profileform.get('email')).toBeDefined();
      expect(component.imageForm).toBeDefined();
      expect(component.imageForm.get('documentImage')).toBeDefined();
    });
  });

  describe('ngOnInit', () => {
    it('should initialize country lists and load profile details for user', async () => {
      await component.ngOnInit();

      expect(component.countries).toBeDefined();
      expect(component.selectedCountry).toBeDefined();
      expect(component.UserRoleID).toBe(3);
      expect(component.UserId).toBe(101);
      expect(mockProfileService.GetUserById).toHaveBeenCalled();
    });
  });

  describe('Phone number formatting', () => {
    it('should format phone number properly in formatPhoneNumber', () => {
      const mockEvent = {
        target: {
          value: '1234567890'
        }
      };
      component.formatPhoneNumber(mockEvent);
      expect(mockEvent.target.value).toBe('123 456 7890');
    });
  });

  describe('Date formatters', () => {
    it('should format date for backend as YYYY-MM-DD', () => {
      const res = component.formatDateForBackend('05/15/2026');
      expect(res).toBe('2026-05-15');
    });

    it('should format date for display', () => {
      const res = component.formatDateForDisplay('2026-05-15');
      expect(res).toBe('05/15/2026');
    });
  });

  describe('Preview functions', () => {
    it('should open and close preview modal', () => {
      component.openPreview('http://example.com/doc.pdf', 'application/pdf');
      expect(component.isModalVisible).toBeTrue();
      expect(component.previewMime).toBe('application/pdf');

      component.closePreview();
      expect(component.isModalVisible).toBeFalse();
    });
  });

  describe('Country Selection and Dropdown', () => {
    it('should toggle country dropdown', () => {
      expect(component.dropdownOpen).toBeFalse();
      component.toggleDropdown();
      expect(component.dropdownOpen).toBeTrue();
    });

    it('should select country', () => {
      const country = { id: 2, name: 'USA', flag: 'us.png' };
      component.selectCountry(country);
      expect(component.selectedCountry).toBe(country);
      expect(component.dropdownOpen).toBeTrue();
    });
  });
});
