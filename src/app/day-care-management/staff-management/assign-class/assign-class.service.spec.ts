import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AssignClassService } from './assign-class.service';
import { environment } from '../../../../environments/environment';

describe('AssignClassService', () => {
  let service: AssignClassService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AssignClassService]
    });
    service = TestBed.inject(AssignClassService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call getDaycareClasses with param and handle success', () => {
      service.getDaycareClasses(10).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Classroom/getDaycareClassListDropdown?ID=10`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should handle getDaycareClasses error (404)', () => {
      let errResp: any;
      service.getDaycareClasses(999).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Classroom/getDaycareClassListDropdown?ID=999`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      expect(errResp.status).toBe(404);
    });

    it('should call getAllAvailableTeachersByCentreID with payload and param and handle success', () => {
      const payload = [{ time: '10:00' }];
      service.getAllAvailableTeachersByCentreID(5, payload).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Classroom/getAllAvailableTeachersByCentreID?ClassID=5`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush([]);
    });

    it('should handle getAllAvailableTeachersByCentreID error (500)', () => {
      let errResp: any;
      service.getAllAvailableTeachersByCentreID(5, []).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Classroom/getAllAvailableTeachersByCentreID?ClassID=5`);
      req.flush('Server Error', { status: 500, statusText: 'Server Error' });
      expect(errResp.status).toBe(500);
    });

    it('should call getAllDays and handle success', () => {
      service.getAllDays().subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Classroom/getAllDays`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should call BulkClassAssignment with wrapped payload and handle success', () => {
      const inputArr = [{ id: 1 }];
      service.BulkClassAssignment(inputArr).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Classroom/BulkClassAssignment`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ BulkTeacherAssignment: inputArr, UserType: 'DayCare' });
      req.flush({});
    });

    it('should handle BulkClassAssignment network error (0)', () => {
      let errResp: any;
      service.BulkClassAssignment([]).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Classroom/BulkClassAssignment`);
      req.error(new ProgressEvent('Network Error'));
      expect(errResp.status).toBe(0);
    });
  });
});
