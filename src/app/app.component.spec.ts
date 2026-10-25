import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ApplicationsSettingsService } from './settings/application-settings/applications-settings/applications-settings.service';
import { Title } from '@angular/platform-browser';
import { AppService } from './app.service';
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from './common-component/common.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockAppSettingsService: jasmine.SpyObj<ApplicationsSettingsService>;
  let mockTitle: jasmine.SpyObj<Title>;
  let mockAppService: jasmine.SpyObj<AppService>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;

  beforeEach(async () => {
    mockAppSettingsService = jasmine.createSpyObj('ApplicationsSettingsService', ['GetApplicationSetting']);
    mockTitle = jasmine.createSpyObj('Title', ['setTitle']);
    mockAppService = jasmine.createSpyObj('AppService', ['changeFavicon']);
    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'set']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['TokenMatchQueryParam']);

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: ApplicationsSettingsService, useValue: mockAppSettingsService },
        { provide: Title, useValue: mockTitle },
        { provide: AppService, useValue: mockAppService },
        { provide: CookieService, useValue: mockCookieService },
        { provide: CommonService, useValue: mockCommonService },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({}),
            snapshot: { queryParamMap: { get: () => null } },
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(AppComponent, {
        set: {
          imports: [],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should have the 'Kinder-Hub' title`, () => {
    expect(component.title).toEqual('Kinder-Hub');
  });

  it('should have rootUrl defined from environment', () => {
    expect(component.rootUrl).toBeDefined();
  });

  describe('ngOnInit', () => {
    it('should set main-color to stored cookie value if theme-color exists', () => {
      mockCookieService.get.and.returnValue('#123456');
      spyOn(document.documentElement.style, 'setProperty');

      component.ngOnInit();

      expect(mockCookieService.get).toHaveBeenCalledWith('theme-color');
      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--main-color', '#123456');
    });

    it('should set main-color to default #a2719e if theme-color cookie is absent', () => {
      mockCookieService.get.and.returnValue('');
      spyOn(document.documentElement.style, 'setProperty');

      component.ngOnInit();

      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--main-color', '#a2719e');
    });

    it('should setup switcher-btn click handler to toggle active class', () => {
      const switcherBtn = document.createElement('div');
      switcherBtn.className = 'switcher-btn';
      const colorSwitcher = document.createElement('div');
      colorSwitcher.className = 'color-switcher';
      document.body.appendChild(switcherBtn);
      document.body.appendChild(colorSwitcher);

      component.ngOnInit();

      switcherBtn.click();
      expect(colorSwitcher.classList.contains('active')).toBeTrue();
      switcherBtn.click();
      expect(colorSwitcher.classList.contains('active')).toBeFalse();

      document.body.removeChild(switcherBtn);
      document.body.removeChild(colorSwitcher);
    });

    it('should setup theme-buttons click handler to update theme-color cookie and style', () => {
      const themeBtn = document.createElement('div');
      themeBtn.className = 'theme-buttons';
      themeBtn.setAttribute('data-color', '#ff5722');
      document.body.appendChild(themeBtn);
      spyOn(document.documentElement.style, 'setProperty');

      component.ngOnInit();
      themeBtn.click();

      expect(mockCookieService.set).toHaveBeenCalledWith('theme-color', '#ff5722');
      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--main-color', '#ff5722');

      document.body.removeChild(themeBtn);
    });
  });

  describe('ngAfterViewInit and hidePreloader', () => {
    it('should fade out and hide preloader when preloader element exists', fakeAsync(() => {
      const preloader = document.createElement('div');
      preloader.id = 'preloader';
      document.body.appendChild(preloader);

      component.ngAfterViewInit();
      tick(500);

      expect(preloader.style.opacity).toBe('0');
      expect(preloader.style.background).toBe('rgb(0, 0, 0)');

      tick(500);
      expect(preloader.style.display).toBe('none');

      document.body.removeChild(preloader);
    }));

    it('should handle missing preloader element gracefully', fakeAsync(() => {
      spyOn(console, 'warn');
      component.ngAfterViewInit();
      tick(1000);
      expect(console.warn).toHaveBeenCalledWith('Preloader element not found!');
    }));
  });
});
