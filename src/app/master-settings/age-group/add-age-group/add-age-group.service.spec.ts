import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AddAgeGroupService } from './add-age-group.service';
import { environment } from '../../../../environments/environment';

describe('AddAgeGroupService', () => {
  let service: AddAgeGroupService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AddAgeGroupService]
    });
    service = TestBed.inject(AddAgeGroupService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call ManageAgeGroup with payload and handle success', () => {
      let response: any;
      const payload = { test: 123 };
      service.ManageAgeGroup(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/manageAgeGroup`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle ManageAgeGroup error (400)', () => {
      let errResp: any;
      service.ManageAgeGroup({}).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/manageAgeGroup`);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
      expect(errResp.status).toBe(400);
    });

    it('should call GetAgeGroupByID with params and handle success', () => {
      let response: any;
      service.GetAgeGroupByID(1).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/getAgeGroupByID?ID=1`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call ActiveInactiveAgeGroup with params and handle error (404)', () => {
      let errResp: any;
      service.ActiveInactiveAgeGroup(99).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/activeInactiveAgeGroup?ID=99`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      expect(errResp.status).toBe(404);
    });

    it('should call GetAllAgeGroup and handle success', () => {
      let response: any;
      service.GetAllAgeGroup().subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/getAllAgeGroups`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });
  });
});
