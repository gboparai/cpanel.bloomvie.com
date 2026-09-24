import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AddMasterFacilityService } from './add-master-facility.service';
import { environment } from '../../../environments/environment';

describe('AddMasterFacilityService', () => {
  let service: AddMasterFacilityService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AddMasterFacilityService]
    });
    service = TestBed.inject(AddMasterFacilityService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call ManageFacility with payload and handle success', () => {
      let response: any;
      const payload = { test: 123 };
      service.ManageFacility(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/manageFacilities`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle ManageFacility error (500)', () => {
      let errResp: any;
      service.ManageFacility({}).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/manageFacilities`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
      expect(errResp.status).toBe(500);
    });

    it('should call GetAllFacilities and handle success', () => {
      let response: any;
      service.GetAllFacilities().subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/getAllFacility`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call GetFacilityById with params and handle success', () => {
      let response: any;
      service.GetFacilityById(1).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/getFacilitiesByID?id=1`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call ActiveInactiveFacilityId with params and handle network error (0)', () => {
      let errResp: any;
      service.ActiveInactiveFacilityId(5).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/activeInactiveFacilityByID?id=5`);
      req.error(new ProgressEvent('Network Timeout'));
      expect(errResp.status).toBe(0);
    });
  });
});
