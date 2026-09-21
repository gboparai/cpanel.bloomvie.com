import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OnboardingService } from './onboarding.service';
import { environment } from '../../environments/environment';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { CommonService } from '../common-component/common.service';
import Swal from 'sweetalert2';

describe('OnboardingService', () => {
  let service: OnboardingService;
  let httpTestingController: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const rSpy = jasmine.createSpyObj('Router', ['navigate']);
    const commonSpy = jasmine.createSpyObj('CommonService', ['']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        OnboardingService,
        { provide: Router, useValue: rSpy },
        { provide: CommonService, useValue: commonSpy }
      ]
    });
    service = TestBed.inject(OnboardingService);
    httpTestingController = TestBed.inject(HttpTestingController);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Tab Management', () => {
    it('should set currentTab correctly using getCurrentTab when steps are incomplete', () => {
      service.onBoardingData = {
        isCompleteStep1: true,
        isCompleteStep2: true,
        isCompleteStep3: false, // Tab-3 is incomplete
        isCompleteStep4: false
      };
      service.getCurrentTab();
      expect(service.currentTab).toBe('Tab-3');
    });

    it('should navigate to daycare-dashboard if all steps are complete', () => {
      service.onBoardingData = {
        isCompleteStep1: true,
        isCompleteStep2: true,
        isCompleteStep3: true,
        isCompleteStep4: true,
        isCompleteStep5: true,
        isCompleteStep6: true,
        isCompleteStep7: true,
        isCompleteStep8: true
      };
      service.getCurrentTab();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/daycare-dashboard']);
    });

    it('should change tab via onChangeTab', () => {
      service.onChangeTab('Tab-5');
      expect(service.currentTab).toBe('Tab-5');
    });
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call getDayCareOnBoardingCurrentTab with correct params and handle success', () => {
      service.getDayCareOnBoardingCurrentTab(123).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/getDayCareOnboarding?dayCareID=123`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should handle getDayCareOnBoardingCurrentTab error (404)', () => {
      let errResp: any;
      service.getDayCareOnBoardingCurrentTab(999).subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/getDayCareOnboarding?dayCareID=999`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      expect(errResp.status).toBe(404);
    });

    it('should call getAccountDetails with correct params when steps provided', () => {
      service.getAccountDetails(1, 'step1').subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/getAccountDetails?id=1&stripeSteps=step1`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call getAccountDetails with empty stripeSteps when not provided and handle 500 error', () => {
      let errResp: any;
      service.getAccountDetails(1).subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/getAccountDetails?id=1&stripeSteps=`);
      expect(req.request.method).toBe('GET');
      req.flush('Server Error', { status: 500, statusText: 'Server Error' });
      expect(errResp.status).toBe(500);
    });

    it('should call manageChildrenList with correct payload and handle success', () => {
      const payload = { file: 'mock-file' };
      service.manageChildrenList(payload).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/uploadBulkChildrenData`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({});
    });

    it('should handle manageChildrenList network timeout (0)', () => {
      let errResp: any;
      service.manageChildrenList({}).subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/uploadBulkChildrenData`);
      req.error(new ProgressEvent('Network error'));
      expect(errResp.status).toBe(0);
    });

    it('should call download with correct params and handle success', () => {
      service.download(99).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/childrenBulUploadByCenterID?centreId=99`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call getInterestedDayCare with correct params and handle 400 error', () => {
      let errResp: any;
      service.getInterestedDayCare('Admin').subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Dashboard/getInterestedDayCare?UserType=Admin`);
      expect(req.request.method).toBe('GET');
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
      expect(errResp.status).toBe(400);
    });
  });

  describe('SweetAlert handleNext', () => {
    it('should trigger SweetAlert with correct message and handle confirmation', async () => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false }));
      spyOn(service, 'getCurrentTab');

      service.handleNext('Tab-1');

      expect(Swal.fire).toHaveBeenCalled();

      // Allow promise to resolve
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(service.getCurrentTab).toHaveBeenCalled();
    });

    it('should not call getCurrentTab if cancelled', async () => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: false, isDenied: false, isDismissed: true }));
      spyOn(service, 'getCurrentTab');

      service.handleNext('Tab-1');

      await new Promise(resolve => setTimeout(resolve, 0));
      expect(service.getCurrentTab).not.toHaveBeenCalled();
    });
  });
});
