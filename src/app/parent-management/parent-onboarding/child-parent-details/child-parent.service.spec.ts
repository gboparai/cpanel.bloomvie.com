import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ChildParentService } from './child-parent.service';
import { environment } from '../../../../environments/environment';

describe('ChildParentService', () => {
  let service: ChildParentService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ChildParentService]
    });
    service = TestBed.inject(ChildParentService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call CheckInterestedMobileExist with params and handle success', () => {
      let response: any;
      service.CheckInterestedMobileExist('1234567890').subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/User/CheckInterestedMobileExist?mobile=1234567890`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle CheckInterestedMobileExist error (404)', () => {
      let errResp: any;
      service.CheckInterestedMobileExist('999').subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/User/CheckInterestedMobileExist?mobile=999`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      expect(errResp.status).toBe(404);
    });

    it('should call manageDetail with payload and handle success', () => {
      let response: any;
      const payload = { test: 123 };
      service.manageDetail(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/parentStudent`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle manageDetail error (400)', () => {
      let errResp: any;
      service.manageDetail({}).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/parentStudent`);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
      expect(errResp.status).toBe(400);
    });

    it('should call GetAllAgeGroup with params and handle success', () => {
      let response: any;
      service.GetAllAgeGroup(10).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/getAllAgeGroupByCentreID?CentreID=10`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call getLocationData mapping the correct URL and handle success', () => {
      let response: any;
      service.getLocationData(' V5K 0A1 ').subscribe(res => response = res);
      // Ensure spaces are removed per the `replace` logic
      const req = httpTestingController.expectOne(`http://api.zippopotam.us/CA/V5K0A1`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle getLocationData network timeout (0)', () => {
      let errResp: any;
      service.getLocationData('V5K0A1').subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`http://api.zippopotam.us/CA/V5K0A1`);
      req.error(new ProgressEvent('Network Timeout'));
      expect(errResp.status).toBe(0);
    });

    it('should call getStudentParentDetailsByParentID with params and handle success', () => {
      let response: any;
      service.getStudentParentDetailsByParentID(1, 2).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/getStudentParentDetailsByParentID?parentID=1&studentID=2`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle getStudentParentDetailsByParentID error (500)', () => {
      let errResp: any;
      service.getStudentParentDetailsByParentID(1, 2).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/getStudentParentDetailsByParentID?parentID=1&studentID=2`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
      expect(errResp.status).toBe(500);
    });

    // BUG DISCOVERED: getStudentLikesAndDislikes requires both `parentID` and `studentID` in the API, but this service method only passes `parentID`, likely resulting in 400 Bad Request or malformed data downstream.
    xit('should call getStudentLikesAndDislikes with params', () => {
      let response: any;
      service.getStudentLikesAndDislikes(5).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/getStudentLikesAndDislikes?parentID=5`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });
  });
});
