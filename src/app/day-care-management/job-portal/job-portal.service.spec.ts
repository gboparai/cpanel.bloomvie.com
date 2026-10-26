import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { JobPortalService } from './job-portal.service';
import { environment } from '../../../environments/environment';

describe('JobPortalService', () => {
  let service: JobPortalService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [JobPortalService],
    });
    service = TestBed.inject(JobPortalService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should post manageJobsPosting', () => {
    const jobData = { title: 'ECE Educator', salary: 50000 };
    service.manageJobsPosting(jobData).subscribe();

    const req = httpTestingController.expectOne(`${environment.apiUrl}/SubscriptionPlans/manageJobPosting`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(jobData);
    req.flush({ success: true });
  });

  it('should get job types', () => {
    service.getJobType().subscribe();

    const req = httpTestingController.expectOne(`${environment.apiUrl}/Frontend/getJobType`);
    expect(req.request.method).toBe('GET');
    req.flush(['Full-Time', 'Part-Time']);
  });

  it('should get available job posts count for centre', () => {
    service.getAvaiableJobPostsCount(10).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/SubscriptionPlans/getAvaiableJobPostsCount?CentreID=10`
    );
    expect(req.request.method).toBe('GET');
    req.flush({ remainingPosts: 3 });
  });

  it('should post UpgradeJobPostingAfterPayment', () => {
    const paymentModel = { transactionId: 'TX789', amount: 150 };
    service.UpgradeJobPostingAfterPayment(paymentModel).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/SubscriptionPlans/UpgradeJobPostingAfterPayment`
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(paymentModel);
    req.flush({ success: true });
  });

  it('should get all job post plans', () => {
    service.getAllJobPostPlans().subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/SubscriptionPlans/getAllJobPostPlans`
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
