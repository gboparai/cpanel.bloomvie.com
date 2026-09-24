import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AddMasterActivityService } from './add-master-activity.service';
import { environment } from '../../../environments/environment';

describe('AddMasterActivityService', () => {
  let service: AddMasterActivityService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AddMasterActivityService]
    });
    service = TestBed.inject(AddMasterActivityService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call ManageActivity with payload and handle success', () => {
      let response: any;
      const payload = { test: 123 };
      service.ManageActivity(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Classroom/manageActivities`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle ManageActivity error (500)', () => {
      let errResp: any;
      service.ManageActivity({}).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Classroom/manageActivities`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
      expect(errResp.status).toBe(500);
    });

    it('should call GetAllActivities with correctly mapped payload and handle success', () => {
      let response: any;
      const inputBO = { isActive: true, searchText: 'search', ignoreMe: 'yes' };
      service.GetAllActivities(inputBO).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Classroom/getAllActivities`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ isActive: true, searchText: 'search' }); // Maps cleanly
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call GetActivityById with params and handle success', () => {
      let response: any;
      service.GetActivityById(1).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Classroom/getActivitiesByID?id=1`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call ActiveInactiveById with params and handle network error (0)', () => {
      let errResp: any;
      service.ActiveInactiveById(5).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Classroom/activeInActiveMasterActivitiesByID?id=5`);
      req.error(new ProgressEvent('Network Timeout'));
      expect(errResp.status).toBe(0);
    });
  });
});
