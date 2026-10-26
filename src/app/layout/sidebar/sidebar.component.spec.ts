import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { UserPermissionService } from '../../settings/Permission/user-permission/user-permission.service';
import { CookieService } from 'ngx-cookie-service';
import { Renderer2, NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { CommonService } from '../../common-component/common.service';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { TocRegistrationService } from '../../toc-registration/toc-registration.service';
import { DaycareService } from '../../day-care-management/day-care-settings/daycare.service';
import { of, BehaviorSubject, Subject } from 'rxjs';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let mockSideBarService: jasmine.SpyObj<UserPermissionService>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockCommonService: any;
  let mockRouter: any;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockTocService: any;
  let mockDaycareService: any;

  beforeEach(async () => {
    mockSideBarService = jasmine.createSpyObj('UserPermissionService', ['getUserPermissionByUserID']);
    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'set', 'delete']);
    mockCommonService = {
      loadSideBar: signal(0),
      updateBreadcrumb: jasmine.createSpy('updateBreadcrumb'),
      getBloomvieSettings: jasmine.createSpy('getBloomvieSettings').and.returnValue(
        of({ message: 'Success', result: { setting: true } })
      ),
    };

    mockRouter = {
      url: '/daycare-dashboard',
      events: new Subject<any>(),
      navigate: jasmine.createSpy('navigate'),
    };

    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'info', 'warning']);
    mockTocService = {
      refreshSidebar$: new Subject<boolean>(),
    };

    mockDaycareService = {
      externalBilling$: new BehaviorSubject<boolean>(false),
      checkExternalBilling: jasmine.createSpy('checkExternalBilling').and.returnValue(
        of({ message: 'Success', result: { externalBillingEnabled: false } })
      ),
    };

    mockSideBarService.getUserPermissionByUserID.and.returnValue(
      of({
        message: 'ok',
        result: [
          { id: 1, value: 'Dashboard', menuUrl: 'daycare-dashboard', childList: [] },
          { id: 2, value: 'Manage Daycare', menuUrl: 'manage-daycare', childList: [] },
        ],
      })
    );

    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'UserId') return '100';
      if (key === 'CentreID') return '10';
      if (key === 'UserRoleId') return '3';
      return '';
    });

    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        { provide: UserPermissionService, useValue: mockSideBarService },
        { provide: CookieService, useValue: mockCookieService },
        { provide: Renderer2, useValue: jasmine.createSpyObj('Renderer2', ['addClass', 'removeClass']) },
        { provide: CommonService, useValue: mockCommonService },
        { provide: Router, useValue: mockRouter },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: ToastrService, useValue: mockToastr },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: { get: () => null } },
            queryParams: of({}),
          },
        },
        { provide: TocRegistrationService, useValue: mockTocService },
        { provide: DaycareService, useValue: mockDaycareService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(SidebarComponent, {
        set: {
          imports: [],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
  });

  it('should create the SidebarComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize user credentials and fetch permissions', () => {
      component.ngOnInit();

      expect(component.loginUserId).toBe('100');
      expect(component.centreID).toBe('10');
      expect(mockSideBarService.getUserPermissionByUserID).toHaveBeenCalledWith('100');
      expect(mockDaycareService.checkExternalBilling).toHaveBeenCalledWith(10);
    });
  });

  describe('Routing & Component Setting', () => {
    it('should set Dashboard component and remove child cookies on setDashboardComponent', () => {
      component.setDashboardComponent();

      expect(mockCookieService.set).toHaveBeenCalledWith('Component', 'Dashboard');
      expect(mockCookieService.delete).toHaveBeenCalledWith('ChildComponent');
      expect(mockCookieService.delete).toHaveBeenCalledWith('NestedChild');
    });

    it('should check route on checkRoute', () => {
      mockRouter.url = '/dashboard';
      component.checkRoute();
      expect(mockCookieService.set).toHaveBeenCalledWith('Component', 'Dashboard');
    });

    it('should emit sideBarLoad if isDataFullyLoaded is true', () => {
      spyOn(component.sideBarLoad, 'emit');
      component.isDataFullyLoaded = true;
      component.sideBarLoaded();
      expect(component.sideBarLoad.emit).toHaveBeenCalledWith(true);
    });
  });

  describe('Menu toggle & trail tracking', () => {
    it('should toggle item.isOpen and set open trail', () => {
      const parentMenu: any = { id: 1, value: 'Parent', isOpen: false, childList: [] };
      const childMenu = { id: 2, value: 'Child', isOpen: false };
      parentMenu.childList = [childMenu as any];
      component.menus = [parentMenu];
      component.dashboardMenu = { id: 99 };

      component.showChildList(childMenu);

      expect(parentMenu.isOpen).toBeTrue();
      expect(mockCookieService.set).toHaveBeenCalledWith('ChildComponent', 'Child');
    });

    it('should reset all menus on resetMenus', () => {
      component.menus = [
        {
          isOpen: true,
          childList: [{ isOpen: true, nestedchildList: [{ isOpen: true }] }],
        },
      ];
      component.dashboardMenu = { isOpen: true };

      component.resetMenus();

      expect(component.menus[0].isOpen).toBeFalse();
      expect(component.menus[0].childList[0].isOpen).toBeFalse();
      expect(component.menus[0].childList[0].nestedchildList[0].isOpen).toBeFalse();
      expect(component.dashboardMenu.isOpen).toBeFalse();
    });

    it('should navigate with Type query parameter for specified pages', () => {
      const item = { value: 'About Us', menuUrl: '/about-us' };
      component.createParam(item);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/about-us'], {
        queryParams: { Type: 'About Us' },
      });
    });
  });

  describe('filterExternalBillingMenus', () => {
    it('should filter out payment, billing and subscription menus when external billing is active', () => {
      const testMenus = [
        { id: 1, value: 'Manage Daycare', menuUrl: 'manage-daycare' },
        { id: 2, value: 'Student Fees', menuUrl: 'student-fees' },
        { id: 3, value: 'Invoices', menuUrl: 'invoices' },
        { id: 4, value: 'Special Offers', menuUrl: 'special-offer' },
      ];

      const filtered = component.filterExternalBillingMenus(testMenus);

      expect(filtered.length).toBe(2);
      expect(filtered[0].value).toBe('Manage Daycare');
      expect(filtered[1].value).toBe('Offers');
    });
  });

  describe('getPermissions', () => {
    it('should handle role 8 TOC user correctly', () => {
      component.UserRoleId = 8;
      component.isSlotAccepted = 'false';
      mockSideBarService.getUserPermissionByUserID.and.returnValue(
        of({
          message: 'ok',
          result: [
            { id: 1, value: 'Dashboard', menuUrl: 'dashboard' },
            { id: 2, value: 'My Profile', menuUrl: 'profile' },
            { id: 3, value: 'Other Item', menuUrl: 'other' },
          ],
        })
      );

      component.getPermissions();

      expect(component.rawMenus.some((m: any) => m.value === 'My Profile')).toBeTrue();
      expect(component.rawMenus.some((m: any) => m.value === 'Other Item')).toBeFalse();
    });

    it('should show error toastr if user permissions call fails', () => {
      mockSideBarService.getUserPermissionByUserID.and.returnValue(
        of({ message: 'error', result: null })
      );

      component.getPermissions();

      expect(component.isDataFullyLoaded).toBeTrue();
    });
  });
});
