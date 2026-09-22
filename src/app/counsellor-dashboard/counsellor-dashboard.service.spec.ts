import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CounsellorDashboardService } from './counsellor-dashboard.service';
import { environment } from '../../environments/environment';

describe('CounsellorDashboardService', () => {
  let service: CounsellorDashboardService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CounsellorDashboardService]
    });
    service = TestBed.inject(CounsellorDashboardService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call getTodaysMeetings with params and handle success', () => {
      let response: any;
      service.getTodaysMeetings(10).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Dashboard/getTodaysMeetings?CounsellorID=10`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle getTodaysMeetings error (404)', () => {
      let errResp: any;
      service.getTodaysMeetings(99).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Dashboard/getTodaysMeetings?CounsellorID=99`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      expect(errResp.status).toBe(404);
    });

    it('should call getCounsellorDashboardCount with params and handle success', () => {
      let response: any;
      service.getCounsellorDashboardCount(5, 'UTC').subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Dashboard/getCounsellorDashboardCount?counsellorID=5&TimeZone=UTC`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle getCounsellorDashboardCount error (500)', () => {
      let errResp: any;
      service.getCounsellorDashboardCount(5, 'UTC').subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Dashboard/getCounsellorDashboardCount?counsellorID=5&TimeZone=UTC`);
      req.flush('Server Error', { status: 500, statusText: 'Server Error' });
      expect(errResp.status).toBe(500);
    });
  });
});
