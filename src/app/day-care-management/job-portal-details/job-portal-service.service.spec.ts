import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { JobPortalServiceService } from './job-portal-service.service';
import { environment } from '../../../environments/environment';

describe('JobPortalServiceService', () => {
  let service: JobPortalServiceService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [JobPortalServiceService],
    });
    service = TestBed.inject(JobPortalServiceService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all job postings by dayCareID and Status', () => {
    service.getAllJobPostings(5, 'Active').subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/SubscriptionPlans/getAllJobPostingsByDayCareID?dayCareID=5&Status=Active`
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should get job posting by ID', () => {
    service.getJobByID(10).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/SubscriptionPlans/getJobPostingByID?id=10`
    );
    expect(req.request.method).toBe('GET');
    req.flush({ id: 10, title: 'Teacher' });
  });

  it('should toggle active/inactive state by ID', () => {
    service.activeInActiveByID(10, true).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/SubscriptionPlans/activeInActiveByID?id=10&isActive=true`
    );
    expect(req.request.method).toBe('GET');
    req.flush({ success: true });
  });

  it('should get applied job postings by centre ID', () => {
    service.getAppliedJobPostings(5).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Frontend/getAppliedJobPostingByCentreID?id=5`
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should call manageTeacherApproval with approvalType query param', () => {
    const form = { teacherId: 8 };
    service.manageTeacherApproval(form, 'approve').subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Frontend/manageApproval?approvalType=approve`
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(form);
    req.flush({ success: true });
  });

  it('should validate token for teacher', () => {
    service.ValidateToken(8, 'tok123').subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Frontend/ValidateToken?teacherID=8&token=tok123`
    );
    expect(req.request.method).toBe('GET');
    req.flush({ valid: true });
  });
});
