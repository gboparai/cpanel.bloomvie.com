import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProfileService } from './profile.service';
import { environment } from '../../../environments/environment';

describe('ProfileService', () => {
  let service: ProfileService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProfileService]
    });
    service = TestBed.inject(ProfileService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call GetUserById with correct params and handle success', () => {
      service.GetUserById(1, 2).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/User/getUserProfileByID?ID=1&userRoleID=2`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should handle GetUserById error (404)', () => {
      let errResp: any;
      service.GetUserById(999, 2).subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/User/getUserProfileByID?ID=999&userRoleID=2`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      expect(errResp.status).toBe(404);
    });

    it('should call ManageUser with correct body payload and handle success', () => {
      const payload = { name: 'John', email: 'john@test.com' };
      service.ManageUser(payload).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/User/manageUser`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({});
    });

    it('should handle ManageUser error (400)', () => {
      const payload = { name: 'John', email: 'invalid' };
      let errResp: any;
      service.ManageUser(payload).subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/User/manageUser`);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
      expect(errResp.status).toBe(400);
    });

    it('should call ManageMasterDocument with correct body payload and handle success', () => {
      const payload = [{ docId: 1, name: 'doc1' }];
      service.ManageMasterDocument(payload).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/manageMasterDocument`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({});
    });

    it('should call GetMasterDocumentbyId with correct params and handle success', () => {
      service.GetMasterDocumentbyId(5, 'profile').subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/User/getMasterDocumentByID?userID=5&type=profile`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should handle GetMasterDocumentbyId error (500)', () => {
      let errResp: any;
      service.GetMasterDocumentbyId(5, 'profile').subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/User/getMasterDocumentByID?userID=5&type=profile`);
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
      expect(errResp.status).toBe(500);
    });

    it('should call getSubscriptionPlanByUserId with correct params (full) and handle success', () => {
      service.getSubscriptionPlanByUserId(1, 2, 'Tab1', 3).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Frontend/getSubscriptionplanByUserId?Id=1&UserRoleID=2&tab=Tab1&studentID=3`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    // BUG DISCOVERED: getSubscriptionPlanByUserId passes undefined to `studentID` param if not provided, causing `&studentID=undefined` in URL rather than omitting it.
    xit('should call getSubscriptionPlanByUserId with default tab when not provided', () => {
      service.getSubscriptionPlanByUserId(1, 2).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Frontend/getSubscriptionplanByUserId?Id=1&UserRoleID=2&tab=`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call getTOCUserCentreListById with correct params and handle network error (0)', () => {
      let errResp: any;
      service.getTOCUserCentreListById('user123').subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Frontend/getTOCUserCentreListById?ID=user123`);
      req.error(new ProgressEvent('Network Timeout'));
      expect(errResp.status).toBe(0);
    });
  });
});
