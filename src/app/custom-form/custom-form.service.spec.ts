import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CustomFormService } from './custom-form.service';
import { environment } from '../../environments/environment';

describe('CustomFormService', () => {
  let service: CustomFormService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CustomFormService]
    });
    service = TestBed.inject(CustomFormService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call SubmitControlAndLabelForm with payload and handle success', () => {
      let response: any;
      const payload = { test: 123 };
      service.SubmitControlAndLabelForm(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DynamicForm/SubmitControlAndLabelForm`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle SubmitControlAndLabelForm error (500)', () => {
      let errResp: any;
      service.SubmitControlAndLabelForm({}).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DynamicForm/SubmitControlAndLabelForm`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
      expect(errResp.status).toBe(500);
    });

    it('should call SubmitControlFieldAnswers with payload and handle success', () => {
      let response: any;
      const payload = { test: 123 };
      service.SubmitControlFieldAnswers(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/SubmitControlFieldAnswers`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call SubmitSection with payload and handle success', () => {
      let response: any;
      const payload = { section: 'yes' };
      service.SubmitSection(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DynamicForm/SubmitSection`);
      expect(req.request.method).toBe('POST');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle SubmitSection network error (0)', () => {
      let errResp: any;
      service.SubmitSection({}).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DynamicForm/SubmitSection`);
      req.error(new ProgressEvent('Timeout'));
      expect(errResp.status).toBe(0);
    });

    it('should call GetSectionByCentreID with params and handle success', () => {
      let response: any;
      service.GetSectionByCentreID(10).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DynamicForm/GetSectionByCentreID?centreID=10`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle GetSectionByCentreID error (404)', () => {
      let errResp: any;
      service.GetSectionByCentreID(99).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DynamicForm/GetSectionByCentreID?centreID=99`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      expect(errResp.status).toBe(404);
    });
  });
});
