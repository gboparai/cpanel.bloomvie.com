import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TeacherAreaOfExpertiseService } from './teacher-area-of-expertise.service';
import { environment } from '../../../environments/environment';

describe('TeacherAreaOfExpertiseService', () => {
  let service: TeacherAreaOfExpertiseService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TeacherAreaOfExpertiseService]
    });
    service = TestBed.inject(TeacherAreaOfExpertiseService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call getAreaOfExpertise with param and handle success', () => {
      service.getAreaOfExpertise('math').subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/User/GetAreaOfExpertise?searchText=math`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should handle getAreaOfExpertise error (500)', () => {
      let errResp: any;
      service.getAreaOfExpertise('science').subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/User/GetAreaOfExpertise?searchText=science`);
      req.flush('Error', { status: 500, statusText: 'Internal Error' });
      expect(errResp.status).toBe(500);
    });

    it('should call manageAreaOfExpertise with body and handle success', () => {
      const payload = { name: 'art' };
      service.manageAreaOfExpertise(payload).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/User/ManageAreaOfExpertise`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({});
    });

    it('should handle manageAreaOfExpertise network timeout (0)', () => {
      let errResp: any;
      service.manageAreaOfExpertise({}).subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/User/ManageAreaOfExpertise`);
      req.error(new ProgressEvent('Timeout'));
      expect(errResp.status).toBe(0);
    });

    it('should call activeInActiveAreaOfExpertise with param and handle success', () => {
      service.activeInActiveAreaOfExpertise(1).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/User/ActiveInActiveAreaOfExpertise?expertiseID=1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toBeNull();
      req.flush({});
    });

    it('should handle activeInActiveAreaOfExpertise error (404)', () => {
      let errResp: any;
      service.activeInActiveAreaOfExpertise(99).subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/User/ActiveInActiveAreaOfExpertise?expertiseID=99`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      expect(errResp.status).toBe(404);
    });
  });
});
