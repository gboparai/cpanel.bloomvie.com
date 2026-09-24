import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RoleSpecializationService } from './role-specialization.service';
import { environment } from '../../../environments/environment';

describe('RoleSpecializationService', () => {
  let service: RoleSpecializationService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RoleSpecializationService]
    });
    service = TestBed.inject(RoleSpecializationService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call ManageRoleSpecialization with payload and handle success', () => {
      let response: any;
      const payload = { test: 123 };
      service.ManageRoleSpecialization(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/manageRoleSpecialization`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle ManageRoleSpecialization error (400)', () => {
      let errResp: any;
      service.ManageRoleSpecialization({}).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/manageRoleSpecialization`);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
      expect(errResp.status).toBe(400);
    });

    it('should call getRoleSpecializationByID with params and handle success', () => {
      let response: any;
      service.getRoleSpecializationByID(1).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/getRoleSpecializationByID?ID=1`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call activeInactiveRoleSpecialization with params and handle error (404)', () => {
      let errResp: any;
      service.activeInactiveRoleSpecialization(99).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/activeInactiveRoleSpecialization?ID=99`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      expect(errResp.status).toBe(404);
    });

    it('should call getAllRoleSpecializations and handle success', () => {
      let response: any;
      service.getAllRoleSpecializations().subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/getAllRoleSpecializations`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });
  });
});
