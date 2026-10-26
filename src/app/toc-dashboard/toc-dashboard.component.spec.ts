import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TocDashboardComponent } from './toc-dashboard.component';
import { ActivatedRoute, Router } from '@angular/router';
import { TocRegistrationService } from '../toc-registration/toc-registration.service';
import { CookieService } from 'ngx-cookie-service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

describe('TocDashboardComponent', () => {
  let component: TocDashboardComponent;
  let fixture: ComponentFixture<TocDashboardComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockTocService: jasmine.SpyObj<TocRegistrationService>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let modalSpy: jasmine.Spy;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockTocService = jasmine.createSpyObj('TocRegistrationService', ['triggerSidebarRefresh', 'getTOCUserDetailByID']);
    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'set']);

    modalSpy = jasmine.createSpy('modal');
    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: modalSpy,
    });

    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'UserId') return '101';
      return '';
    });

    mockTocService.getTOCUserDetailByID.and.returnValue(of({
      message: 'ok',
      result: { partTimeStartDate: '2025-01-01' }
    }));

    await TestBed.configureTestingModule({
      imports: [TocDashboardComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: TocRegistrationService, useValue: mockTocService },
        { provide: CookieService, useValue: mockCookieService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => '1' }, queryParams: {} },
            queryParams: of({}),
            params: of({})
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(TocDashboardComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(TocDashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should retrieve UserId from cookie and fetch TOC user details', () => {
      spyOn(component, 'getTOCUserDetailByEmail');
      component.ngOnInit();
      expect(mockCookieService.get).toHaveBeenCalledWith('UserId');
      expect(component.UserID).toBe(101);
      expect(component.getTOCUserDetailByEmail).toHaveBeenCalledWith(101);
    });
  });

  describe('Redirection', () => {
    it('should navigate to TOC-registration, trigger sidebar refresh, set cookie and hide modal', () => {
      component.Redirection();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/TOC-registration']);
      expect(mockTocService.triggerSidebarRefresh).toHaveBeenCalled();
      expect(mockCookieService.set).toHaveBeenCalledWith('Component', 'Complete Profile');
      expect((window as any).$).toHaveBeenCalledWith('#AvailabilityModal');
      expect(modalSpy).toHaveBeenCalledWith('hide');
    });
  });

  describe('CloseModal', () => {
    it('should hide the AvailabilityModal', () => {
      component.CloseModal();
      expect((window as any).$).toHaveBeenCalledWith('#AvailabilityModal');
      expect(modalSpy).toHaveBeenCalledWith('hide');
    });
  });

  describe('getTOCUserDetailByEmail', () => {
    it('should set CheckTOCUserDetail and hide modal when partTimeStartDate is present', () => {
      const mockResult = { partTimeStartDate: '2025-01-01', name: 'John Doe' };
      mockTocService.getTOCUserDetailByID.and.returnValue(of({
        message: 'ok',
        result: mockResult
      }));

      component.getTOCUserDetailByEmail(101);

      expect(mockTocService.getTOCUserDetailByID).toHaveBeenCalledWith(101 as any, 0 as any);
      expect(component.CheckTOCUserDetail).toEqual(mockResult);
      expect((window as any).$).toHaveBeenCalledWith('#AvailabilityModal');
      expect(modalSpy).toHaveBeenCalledWith('hide');
    });

    it('should set CheckTOCUserDetail and show modal when partTimeStartDate is null', () => {
      const mockResult = { partTimeStartDate: null, name: 'Jane Doe' };
      mockTocService.getTOCUserDetailByID.and.returnValue(of({
        message: 'ok',
        result: mockResult
      }));

      component.getTOCUserDetailByEmail(101);

      expect(component.CheckTOCUserDetail).toEqual(mockResult);
      expect((window as any).$).toHaveBeenCalledWith('#AvailabilityModal');
      expect(modalSpy).toHaveBeenCalledWith('show');
    });

    it('should reset CheckTOCUserDetail to empty array when message is not ok', () => {
      mockTocService.getTOCUserDetailByID.and.returnValue(of({
        message: 'error',
        result: null
      }));

      component.getTOCUserDetailByEmail(101);

      expect(component.CheckTOCUserDetail).toEqual([]);
    });

    it('should handle API error gracefully and log error to console', () => {
      spyOn(console, 'error');
      mockTocService.getTOCUserDetailByID.and.returnValue(throwError(() => new Error('Server error')));

      component.getTOCUserDetailByEmail(101);

      expect(console.error).toHaveBeenCalledWith('Error occurred while checking email:', jasmine.any(Error));
    });
  });
});
