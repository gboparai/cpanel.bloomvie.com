import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SuuplyService } from './suuply.service';
import { environment } from '../../environments/environment';

describe('SuuplyService', () => {
  let service: SuuplyService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SuuplyService]
    });
    service = TestBed.inject(SuuplyService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call manageSuuplyRequest with payload and handle success', () => {
      let response: any;
      const payload = { test: 123 };
      service.manageSuuplyRequest(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/manageSupplyRequest`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle manageSuuplyRequest error (400)', () => {
      let errResp: any;
      service.manageSuuplyRequest({}).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/manageSupplyRequest`);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
      expect(errResp.status).toBe(400);
    });

    it('should call getSuuplyRequest with params and handle success', () => {
      let response: any;
      service.getSuuplyRequest(1, 'active').subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/getSupplyRequest?CentreadminId=1&status=active`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call approveOrRejectSupplyRequest with params and handle success', () => {
      let response: any;
      service.approveOrRejectSupplyRequest(1, 2, 3).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/approveOrRejectSupplyRequest?statusId=1&itemId=2&loginId=3`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call getSupplyRequestByLoginId with params and handle success', () => {
      let response: any;
      service.getSupplyRequestByLoginId(10).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/getSupplyRequestByLoginId?loginUserId=10`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle getSupplyRequestByLoginId error (404)', () => {
      let errResp: any;
      service.getSupplyRequestByLoginId(99).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/getSupplyRequestByLoginId?loginUserId=99`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      expect(errResp.status).toBe(404);
    });

    it('should call getSupplyRequestById with params and handle success', () => {
      let response: any;
      service.getSupplyRequestById(5).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/getSupplyRequestById?itemId=5`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call DeleteSupply with params and handle success', () => {
      let response: any;
      service.DeleteSupply(1, 'msg').subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/DeleteSupply?itemId=1&Message=msg`);
      expect(req.request.method).toBe('DELETE');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call getAllExpenseTypes and handle network timeout (0)', () => {
      let errResp: any;
      service.getAllExpenseTypes().subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/getAllExpenseTypes`);
      req.error(new ProgressEvent('Timeout'));
      expect(errResp.status).toBe(0);
    });

    it('should call reviewSupplyRequest with payload and handle success', () => {
      let response: any;
      const payload = { item: 'book' };
      service.reviewSupplyRequest(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/reviewSupplyRequest`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });
  });
});
