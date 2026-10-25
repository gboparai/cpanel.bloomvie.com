import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AllJobPostingPlansService } from './all-job-posting-plans.service';
import { environment } from '../../environments/environment';

describe('AllJobPostingPlansService', () => {
  let service: AllJobPostingPlansService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AllJobPostingPlansService],
    });
    service = TestBed.inject(AllJobPostingPlansService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllJobPostingPlans', () => {
    it('should call GET /Centre/getAllJobPostingPlans and return plans', () => {
      let response: any;
      const mockPlans = [{ id: 1, planName: 'Standard', price: 99 }];

      service.getAllJobPostingPlans().subscribe(res => {
        response = res;
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/getAllJobPostingPlans`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPlans);

      expect(response).toEqual(mockPlans);
    });

    it('should handle 500 server error when fetching job plans', () => {
      let errorResponse: any;

      service.getAllJobPostingPlans().subscribe({
        next: () => fail('Should have failed with 500 error'),
        error: err => {
          errorResponse = err;
        },
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/getAllJobPostingPlans`);
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

      expect(errorResponse.status).toBe(500);
    });
  });

  describe('getJobPostingPlan', () => {
    it('should call GET /Centre/getJobPostingPlan with planID param', () => {
      let response: any;
      const mockPlan = { id: 3, planName: 'Premium', price: 199 };

      service.getJobPostingPlan(3).subscribe(res => {
        response = res;
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/getJobPostingPlan?planID=3`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPlan);

      expect(response).toEqual(mockPlan);
    });
  });

  describe('JobPostPlanBuy', () => {
    it('should call POST /Centre/JobPostPlanBuy with model payload', () => {
      let response: any;
      const payload = { planID: 3, centreID: 10, paymentMethod: 'Card' };
      const mockSuccess = { success: true, transactionId: 'TX123' };

      service.JobPostPlanBuy(payload).subscribe(res => {
        response = res;
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/JobPostPlanBuy`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockSuccess);

      expect(response).toEqual(mockSuccess);
    });
  });
});
