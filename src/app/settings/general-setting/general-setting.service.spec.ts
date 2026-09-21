import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GeneralSettingService } from './general-setting.service';
import { environment } from '../../../environments/environment';

describe('GeneralSettingService', () => {
  let service: GeneralSettingService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GeneralSettingService]
    });
    service = TestBed.inject(GeneralSettingService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call assignEntitiesToCenter with body/params and handle success', () => {
      const payload = { entities: [1, 2] };
      service.assignEntitiesToCenter(payload, 10).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/assignEntitiesToCenter?centreId=10`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({});
    });

    it('should handle assignEntitiesToCenter error (500)', () => {
      let errResp: any;
      service.assignEntitiesToCenter({}, 10).subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/assignEntitiesToCenter?centreId=10`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
      expect(errResp.status).toBe(500);
    });

    it('should call getEntitiesByCenter with params and handle success', () => {
      service.getEntitiesByCenter(10).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/getEntitiesByCenter?centreId=10`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should handle getEntitiesByCenter error (404)', () => {
      let errResp: any;
      service.getEntitiesByCenter(99).subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/getEntitiesByCenter?centreId=99`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      expect(errResp.status).toBe(404);
    });

    it('should call manageMasterActivites with body and handle success', () => {
      const payload = { activity: 'Dance' };
      service.manageMasterActivites(payload).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/classroom/manageMasterActivites`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({});
    });

    it('should handle manageMasterActivites network error (0)', () => {
      let errResp: any;
      service.manageMasterActivites({}).subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/classroom/manageMasterActivites`);
      req.error(new ProgressEvent('Network Timeout'));
      expect(errResp.status).toBe(0);
    });

    it('should call getAllAgeGroupsByUserID with params and handle success', () => {
      service.getAllAgeGroupsByUserID(1).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/getAllAgeGroupsByUserID?userid=1`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should call getAllFacilityByUserId with params and handle success', () => {
      service.getAllFacilityByUserId(1).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/getAllFacilityByUserId?userid=1`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should call getAllActivitiesByUserId with params and handle success', () => {
      service.getAllActivitiesByUserId(1).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Classroom/getAllActivitiesByUserId?userid=1`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });
});
