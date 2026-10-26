import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BreadcrumbComponent } from './breadcrumb.component';
import { CookieService } from 'ngx-cookie-service';
import { ApplicationsSettingsService } from '../../settings/application-settings/applications-settings/applications-settings.service';
import { CommonService } from '../common.service';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { of } from 'rxjs';

describe('BreadcrumbComponent', () => {
  let component: BreadcrumbComponent;
  let fixture: ComponentFixture<BreadcrumbComponent>;

  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockAppService: jasmine.SpyObj<ApplicationsSettingsService>;
  let mockCommonService: any;

  beforeEach(async () => {
    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      text: jasmine.createSpy('text')
    });

    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'set', 'delete', 'check']);
    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'CentreName') return 'Bloomvie Daycare';
      if (key === 'UserId') return '101';
      if (key === 'Component') return 'Dashboard';
      if (key === 'NestedChild') return 'Overview';
      if (key === 'ChildComponent') return 'Main';
      return '';
    });

    mockAppService = jasmine.createSpyObj('ApplicationsSettingsService', ['GetApplicationSetting']);
    mockAppService.GetApplicationSetting.and.returnValue(of({
      message: 'Success',
      result: { breadcrumbText: 'Home > Dashboard' }
    }));

    mockCommonService = {
      loadBreadcrumbSignal: signal(false)
    };

    await TestBed.configureTestingModule({
      imports: [BreadcrumbComponent],
      providers: [
        { provide: CookieService, useValue: mockCookieService },
        { provide: ApplicationsSettingsService, useValue: mockAppService },
        { provide: CommonService, useValue: mockCommonService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(BreadcrumbComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(BreadcrumbComponent);
    component = fixture.componentInstance;
  });

  it('should create the BreadcrumbComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should read cookies and application settings', () => {
      component.ngOnInit();

      expect(component.centreName).toBe('Bloomvie Daycare');
      expect(component.loginUserId).toBe('101');
      expect(component.Component).toBe('Dashboard');
      expect(component.nestedChild).toBe('Overview');
      expect(component.ChildComponent).toBe('Main');
      expect(mockAppService.GetApplicationSetting).toHaveBeenCalled();
      expect((window as any).$).toHaveBeenCalledWith('#breadcrumb');
    });
  });

  describe('getBreadcrumbCookies', () => {
    it('should replace Special Offers or Discount Details with Offers if external billing is true', () => {
      spyOn(localStorage, 'getItem').and.callFake((key: string) => key === 'isExternalBilling' ? 'true' : null);
      mockCookieService.get.and.callFake((key: string) => key === 'Component' ? 'Special Offers' : '');

      component.getBreadcrumbCookies();
      expect(component.Component).toBe('Offers');
    });

    it('should keep component name if external billing is false', () => {
      spyOn(localStorage, 'getItem').and.callFake((key: string) => 'false');
      mockCookieService.get.and.callFake((key: string) => key === 'Component' ? 'Special Offers' : '');

      component.getBreadcrumbCookies();
      expect(component.Component).toBe('Special Offers');
    });
  });
});
