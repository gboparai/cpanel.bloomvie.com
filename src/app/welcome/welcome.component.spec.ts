import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { WelcomeComponent } from './welcome.component';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { CommonService } from '../common-component/common.service';
import { ProfileService } from '../common-component/profile/profile.service';
import { WelcomeService } from './welcome.service';
import { UserRoleService } from '../settings/Permission/user-role/user-role.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { LoginService } from '../login/login.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

describe('WelcomeComponent', () => {
  let component: WelcomeComponent;
  let fixture: ComponentFixture<WelcomeComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockCookieService: any;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockProfileService: jasmine.SpyObj<ProfileService>;
  let mockWelcomeService: jasmine.SpyObj<WelcomeService>;
  let mockUserRoleService: jasmine.SpyObj<UserRoleService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockLoginService: jasmine.SpyObj<LoginService>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'set']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['decrypt', 'encrypt', 'TokenMatchQueryParam', 'convertS3File']);
    mockProfileService = jasmine.createSpyObj('ProfileService', ['getUserProfile']);
    mockWelcomeService = jasmine.createSpyObj('WelcomeService', [
      'getCentreIDByStudentID',
      'getDayCareFeatureByCentreID',
      'getAllDayCareContent',
      'getAllDayCareContentLogo',
    ]);
    mockUserRoleService = jasmine.createSpyObj('UserRoleService', ['getUserRolesByID']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'warning', 'error', 'info']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockLoginService = jasmine.createSpyObj('LoginService', ['loadUserFromStorage']);

    await TestBed.configureTestingModule({
      imports: [WelcomeComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: CookieService, useValue: mockCookieService },
        { provide: CommonService, useValue: mockCommonService },
        { provide: ProfileService, useValue: mockProfileService },
        { provide: WelcomeService, useValue: mockWelcomeService },
        { provide: UserRoleService, useValue: mockUserRoleService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: LoginService, useValue: mockLoginService },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({}),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(WelcomeComponent, {
        set: {
          imports: [],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(WelcomeComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should read CentreName from cookie on init', async () => {
      mockCookieService.get.and.callFake((key: string) => {
        if (key === 'CentreName') return 'Bloomvie Early Learning';
        return '';
      });

      await component.ngOnInit();

      expect(component.daycareName).toBe('Bloomvie Early Learning');
    });

    it('should process orderNumber and StudentID query params', fakeAsync(async () => {
      const route = TestBed.inject(ActivatedRoute);
      route.queryParams = of({
        orderNumber: 'enc-order',
        StudentID: 'enc-student',
        token: 'auth-token',
      });
      mockCommonService.decrypt.and.callFake((val: string) => {
        if (val === 'enc-order') return 'ORD123';
        if (val === 'enc-student') return '99';
        return '';
      });
      spyOn(component, 'getCentreIDByStudentID');
      spyOn(component, 'tokenMatch');

      await component.ngOnInit();
      tick();

      expect(mockCookieService.set as any).toHaveBeenCalledWith('orderNumber', 'ORD123', undefined, '/');
      expect(mockCookieService.set as any).toHaveBeenCalledWith('StudentID', '99', undefined, '/');
      expect(component.getCentreIDByStudentID).toHaveBeenCalled();
      expect(component.tokenMatch).toHaveBeenCalled();
    }));
  });

  describe('getCentreIDByStudentID', () => {
    it('should store CentreID and CentreAdminID when response is Success', async () => {
      mockCookieService.get.and.returnValue('99');
      mockWelcomeService.getCentreIDByStudentID.and.returnValue(of({
        message: 'Success',
        result: { centreID: 15, centreAdminID: 25 },
      }) as any);

      await component.getCentreIDByStudentID();

      expect(mockWelcomeService.getCentreIDByStudentID).toHaveBeenCalledWith(99);
      expect(mockCookieService.set as any).toHaveBeenCalledWith('CentreID', 15 as any, undefined, '/');
      expect(mockCookieService.set as any).toHaveBeenCalledWith('CentreAdminID', 25 as any, undefined, '/');
    });
  });

  describe('getDayCareFeatureByCentreID', () => {
    it('should populate dayCareGallery when message is OK', () => {
      mockWelcomeService.getDayCareFeatureByCentreID.and.returnValue(of({
        message: 'OK',
        result: [{ id: 1, title: 'Classrooms' }],
      }));

      component.getDayCareFeatureByCentreID(15);

      expect(component.dayCareGallery).toEqual([{ id: 1, title: 'Classrooms' }]);
    });

    it('should clear dayCareGallery when message is not OK', () => {
      mockWelcomeService.getDayCareFeatureByCentreID.and.returnValue(of({
        message: 'Error',
        result: null,
      }));

      component.getDayCareFeatureByCentreID(15);

      expect(component.dayCareGallery).toEqual([]);
    });
  });

  describe('GetUserRoles', () => {
    it('should log error if UserRoleId is not set', () => {
      spyOn(console, 'error');
      component.UserRoleId = null;
      component.GetUserRoles();
      expect(console.error).toHaveBeenCalledWith('UserRoleId is not defined!');
    });

    it('should set role if response is Ok', () => {
      component.UserRoleId = 3;
      mockUserRoleService.getUserRolesByID.and.returnValue(of({
        message: 'Ok',
        result: { userRole: 'DayCare Admin' },
      }));

      component.GetUserRoles();

      expect(component.role).toBe('DayCare Admin');
    });

    it('should handle service error gracefully', () => {
      spyOn(console, 'error');
      component.UserRoleId = 3;
      mockUserRoleService.getUserRolesByID.and.returnValue(throwError(() => new Error('Service failure')));

      component.GetUserRoles();

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('startOnboarding', () => {
    it('should navigate to parent-onboarding if UserRoleId is 5', () => {
      component.UserRoleId = 5;
      component.startOnboarding();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/parent-onboarding']);
    });

    it('should navigate to onboarding with enc_id query param if UserRoleId is 3 and CentreID > 0', () => {
      component.UserRoleId = 3;
      component.CentreID = 10;
      mockCommonService.encrypt.and.returnValue('enc-10');

      component.startOnboarding();

      expect(mockCommonService.encrypt).toHaveBeenCalledWith('10');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/onboarding'], { queryParams: { enc_id: 'enc-10' } });
    });

    it('should navigate to onboarding without query param if UserRoleId is 3 and CentreID <= 0', () => {
      component.UserRoleId = 3;
      component.CentreID = 0;

      component.startOnboarding();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/onboarding']);
    });
  });

  describe('tokenMatch', () => {
    it('should set user cookies and load user on Success', fakeAsync(() => {
      component.Token = 'sample-jwt-token';
      const apiResponse = {
        message: 'Success',
        result: {
          id: 50,
          centreID: 10,
          userRoleID: 3,
        },
      };
      mockCommonService.TokenMatchQueryParam.and.returnValue(of(apiResponse));
      spyOn(component, 'GetUserRoles');
      spyOn(component, 'AllDayCareContent');
      spyOn(component, 'getDayCareFeatureByCentreID');
      spyOn(component, 'getAllDayCareContentLogo');

      component.tokenMatch();
      tick(400);

      expect(mockCookieService.set as any).toHaveBeenCalledWith('UserId', 50 as any, undefined, '/');
      expect(mockCookieService.set as any).toHaveBeenCalledWith('CentreID', 10 as any, undefined, '/');
      expect(mockCookieService.set as any).toHaveBeenCalledWith('userRoleID', 3 as any, undefined, '/');
      expect(component.GetUserRoles).toHaveBeenCalled();
      expect(component.AllDayCareContent).toHaveBeenCalled();
      expect(mockLoginService.loadUserFromStorage).toHaveBeenCalled();
      expect(mockSpinner.hide).toHaveBeenCalled();
    }));

    it('should show warning on non-Success token match', fakeAsync(() => {
      component.Token = 'bad-token';
      mockCommonService.TokenMatchQueryParam.and.returnValue(of({ message: 'Token Invalid' }));

      component.tokenMatch();
      tick(400);

      expect(mockToastr.warning).toHaveBeenCalledWith('Token Invalid');
      expect(mockSpinner.hide).toHaveBeenCalled();
    }));

    it('should show error on tokenMatch exception', () => {
      component.Token = 'err-token';
      mockCommonService.TokenMatchQueryParam.and.returnValue(throwError(() => ({ message: 'Network Failure' })));

      component.tokenMatch();

      expect(mockToastr.error).toHaveBeenCalledWith('Network Failure');
    });
  });

  describe('AllDayCareContent and getAllDayCareContentLogo', () => {
    it('should map s3ImageUrl using CommonService on AllDayCareContent', () => {
      mockCommonService.convertS3File.and.returnValue('https://s3.aws.com/converted.jpg');
      mockWelcomeService.getAllDayCareContent.and.returnValue(of({
        message: 'OK',
        result: [{ s3ImageUrl: 'raw.jpg', title: 'Content 1' }],
      }));

      component.AllDayCareContent();

      expect(component.skeletonShow).toBeFalse();
      expect(component.dayCareContent[0].s3ImageUrl).toBe('https://s3.aws.com/converted.jpg');
    });

    it('should populate dayCareLogo on getAllDayCareContentLogo', () => {
      mockWelcomeService.getAllDayCareContentLogo.and.returnValue(of({
        message: 'OK',
        result: { logoUrl: 'logo.png' },
      }));

      component.getAllDayCareContentLogo();

      expect(component.dayCareLogo).toEqual({ logoUrl: 'logo.png' });
    });
  });
});
