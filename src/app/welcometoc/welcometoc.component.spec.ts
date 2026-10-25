import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WelcometocComponent } from './welcometoc.component';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { TocRegistrationService } from '../toc-registration/toc-registration.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError, BehaviorSubject } from 'rxjs';
import * as CryptoJS from 'crypto-js';

describe('WelcometocComponent', () => {
  let component: WelcometocComponent;
  let fixture: ComponentFixture<WelcometocComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockTocService: any;
  let queryParamMapSubject: BehaviorSubject<any>;

  beforeEach(async () => {
    queryParamMapSubject = new BehaviorSubject(convertToParamMap({}));
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'set']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error']);
    mockTocService = jasmine.createSpyObj('TocRegistrationService', ['getTOCUserDetailByID']);

    await TestBed.configureTestingModule({
      imports: [WelcometocComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: CookieService, useValue: mockCookieService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: TocRegistrationService, useValue: mockTocService },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: queryParamMapSubject.asObservable(),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(WelcometocComponent, {
        set: {
          imports: [],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(WelcometocComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should decrypt valid query param id and call getTOCUserDetailByEmail', () => {
      const encryptedId = CryptoJS.AES.encrypt('42', 'encrypt!135790').toString();
      spyOn(component, 'getTOCUserDetailByEmail');

      queryParamMapSubject.next(convertToParamMap({ id: encryptedId }));
      component.ngOnInit();

      expect(component.ParamID).toBe(encryptedId);
      expect(component.UserID).toBe('42');
      expect(component.getTOCUserDetailByEmail).toHaveBeenCalledWith('42');
    });

    it('should handle invalid encrypted query param gracefully', () => {
      spyOn(component, 'getTOCUserDetailByEmail');

      queryParamMapSubject.next(convertToParamMap({ id: 'invalid-cipher-text' }));
      component.ngOnInit();

      expect(component.getTOCUserDetailByEmail).not.toHaveBeenCalled();
    });
  });

  describe('getTOCUserDetailByEmail', () => {
    it('should navigate to /toc-dashboard if partTimeStartDate is present', () => {
      mockTocService.getTOCUserDetailByID.and.returnValue(of({
        message: 'ok',
        result: { id: 42, partTimeStartDate: '2026-01-01' },
      }));

      component.getTOCUserDetailByEmail(42);

      expect(mockTocService.getTOCUserDetailByID).toHaveBeenCalledWith(42 as any, 0);
      expect(component.CheckUserDetail).toEqual({ id: 42, partTimeStartDate: '2026-01-01' });
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/toc-dashboard']);
    });

    it('should not navigate if partTimeStartDate is null', () => {
      mockTocService.getTOCUserDetailByID.and.returnValue(of({
        message: 'ok',
        result: { id: 42, partTimeStartDate: null },
      }));

      component.getTOCUserDetailByEmail(42);

      expect(component.CheckUserDetail).toEqual({ id: 42, partTimeStartDate: null });
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should set CheckUserDetail to empty array when message is not ok', () => {
      mockTocService.getTOCUserDetailByID.and.returnValue(of({
        message: 'error',
        result: null,
      }));

      component.getTOCUserDetailByEmail(42);

      expect(component.CheckUserDetail).toEqual([]);
    });

    it('should handle service error gracefully', () => {
      spyOn(console, 'error');
      mockTocService.getTOCUserDetailByID.and.returnValue(throwError(() => new Error('Service error')));

      component.getTOCUserDetailByEmail(42);

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('RedirectToTocRegistration', () => {
    it('should navigate to TOC-registration with id query param', () => {
      component.ParamID = 'encrypted-param-id';

      component.RedirectToTocRegistration();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/TOC-registration'], {
        queryParams: { id: 'encrypted-param-id' },
      });
    });
  });
});
