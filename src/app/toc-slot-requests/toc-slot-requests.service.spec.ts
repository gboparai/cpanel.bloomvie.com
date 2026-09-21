import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TocSlotRequestsService } from './toc-slot-requests.service';
import { environment } from '../../environments/environment';

describe('TocSlotRequestsService', () => {
  let service: TocSlotRequestsService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TocSlotRequestsService]
    });
    service = TestBed.inject(TocSlotRequestsService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call getTocSlotbyUserid with params and handle success', () => {
      let response: any;
      service.getTocSlotbyUserid(1, 2).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Frontend/getTocSlotbyUserid?UserId=1&CentreId=2`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle getTocSlotbyUserid error (404)', () => {
      let errResp: any;
      service.getTocSlotbyUserid(99, 99).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Frontend/getTocSlotbyUserid?UserId=99&CentreId=99`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      expect(errResp.status).toBe(404);
    });

    it('should call SendSlotRequestToDayCare with params and handle success', () => {
      let response: any;
      service.SendSlotRequestToDayCare(1, 2, 3, 'accept').subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Frontend/SendSlotRequestToDayCare?centreId=1&slotId=2&userId=3&acceptReject=accept`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle SendSlotRequestToDayCare network error (0)', () => {
      let errResp: any;
      service.SendSlotRequestToDayCare(1, 2, 3, 'reject').subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Frontend/SendSlotRequestToDayCare?centreId=1&slotId=2&userId=3&acceptReject=reject`);
      req.error(new ProgressEvent('Network Error'));
      expect(errResp.status).toBe(0);
    });
  });
});
