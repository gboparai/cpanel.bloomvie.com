import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TocViewService } from './toc-view.service';
import { environment } from '../../environments/environment';

describe('TocViewService', () => {
  let service: TocViewService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TocViewService]
    });
    service = TestBed.inject(TocViewService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call getAppliedJobTOCList with params and handle success', () => {
      let response: any;
      service.getAppliedJobTOCList('john', 1, 2).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Frontend/getAppliedJobTOCList?Name=john&statusID=1&centreId=2`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle getAppliedJobTOCList error (500)', () => {
      let errResp: any;
      service.getAppliedJobTOCList('john', 1, 2).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Frontend/getAppliedJobTOCList?Name=john&statusID=1&centreId=2`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
      expect(errResp.status).toBe(500);
    });

    it('should call getAppliedJobTOByID with params and handle success', () => {
      let response: any;
      service.getAppliedJobTOByID(10, 5).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Frontend/getAppliedJobTOByID?id=10&centreID=5`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle getAppliedJobTOByID network error (0)', () => {
      let errResp: any;
      service.getAppliedJobTOByID(10, 5).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Frontend/getAppliedJobTOByID?id=10&centreID=5`);
      req.error(new ProgressEvent('Network Timeout'));
      expect(errResp.status).toBe(0);
    });

    it('should call getQualifications and handle success', () => {
      let response: any;
      service.getQualifications().subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Frontend/getMasterQualifications`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call getDocumentTypeList and handle success', () => {
      let response: any;
      service.getDocumentTypeList().subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/User/getAllMasterDocumentType`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call tocApprovedReject with payload and handle success', () => {
      let response: any;
      const payload = { approval: true };
      service.tocApprovedReject(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Frontend/tocApprovedReject`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle tocApprovedReject error (400)', () => {
      let errResp: any;
      service.tocApprovedReject({}).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Frontend/tocApprovedReject`);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
      expect(errResp.status).toBe(400);
    });

    it('should call SendTOCRequestToUser with params and handle success', () => {
      let response: any;
      service.SendTOCRequestToUser(1, 2).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Frontend/SendTOCRequestToUser?Slotid=1&LoginUserid=2`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call SendSlotRequestToUserAtOnce with payload and handle success', () => {
      let response: any;
      const payload = [{ data: 1 }];
      service.SendSlotRequestToUserAtOnce(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Frontend/SendSlotRequestToUserAtOnce`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call GetAllDays and handle success', () => {
      let response: any;
      service.GetAllDays().subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Classroom/getAllDays`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call getTocUserFilter with payload and handle success', () => {
      let response: any;
      const payload = { filter: true };
      service.getTocUserFilter(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Frontend/getTocUserWithOtherFilters`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });
  });
});
