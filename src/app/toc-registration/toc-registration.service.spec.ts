import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TocRegistrationService } from './toc-registration.service';
import { environment } from '../../environments/environment';

describe('TocRegistrationService', () => {
  let service: TocRegistrationService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TocRegistrationService]
    });
    service = TestBed.inject(TocRegistrationService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call getDocumentTypeList and handle success', () => {
      let response: any;
      service.getDocumentTypeList().subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/User/getAllMasterDocumentType`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle getDocumentTypeList error (500)', () => {
      let errResp: any;
      service.getDocumentTypeList().subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/User/getAllMasterDocumentType`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
      expect(errResp.status).toBe(500);
    });

    it('should call ManageAppliedTOC with correctly mapped payload and handle success', () => {
      let response: any;
      const payload = { Data: 'data', SlotTime: 'time' };
      service.ManageAppliedTOC(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Frontend/ManageAppliedTOC`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ Data: 'data', SlotTime: 'time' });
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call ManageTOCMoreCentre with correctly mapped payload and handle success', () => {
      let response: any;
      const payload = { Data: 'data', SlotTime: 'time' };
      service.ManageTOCMoreCentre(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Frontend/ManageTOCMoreCentre`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ Data: 'data', SlotTime: 'time' });
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call updateTocUserDetail with payload and handle success', () => {
      let response: any;
      const payload = { test: 1 };
      service.updateTocUserDetail(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Frontend/updateTocUserDetail`);
      expect(req.request.method).toBe('POST');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle updateTocUserDetail error (400)', () => {
      let errResp: any;
      service.updateTocUserDetail({}).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Frontend/updateTocUserDetail`);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
      expect(errResp.status).toBe(400);
    });

    it('should call uploadImages with payload and handle success', () => {
      let response: any;
      const payload = { test: 1 };
      service.uploadImages(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/uploadImages`);
      expect(req.request.method).toBe('POST');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
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

    it('should call getAllAreaOfExpertise and handle success', () => {
      let response: any;
      service.getAllAreaOfExpertise().subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/User/GetAreaOfExpertise`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call getTOCUserDetailByID with params and handle success', () => {
      let response: any;
      service.getTOCUserDetailByID('usr1', 5).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Frontend/getTOCUserDetailByID?ID=usr1&centreID=5`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call GetUserById with params and handle success', () => {
      let response: any;
      service.GetUserById(10).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/User/getUserByID?ID=10`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call getTOCUserSlotById with params and handle success', () => {
      let response: any;
      service.getTOCUserSlotById(20).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Frontend/getTOCUserSlotById?Id=20`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle getTOCUserSlotById network timeout (0)', () => {
      let errResp: any;
      service.getTOCUserSlotById(20).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Frontend/getTOCUserSlotById?Id=20`);
      req.error(new ProgressEvent('Network Error'));
      expect(errResp.status).toBe(0);
    });

    it('should call updateTOCUserSlot with payload and handle success', () => {
      let response: any;
      const payload = { slot: 1 };
      service.updateTOCUserSlot(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Frontend/updateTOCUserSlot`);
      expect(req.request.method).toBe('POST');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call deleteTOCUserSlot with payload and handle success', () => {
      let response: any;
      const payload = { slot: 1 };
      service.deleteTOCUserSlot(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Frontend/deleteTOCUserSlot`);
      expect(req.request.method).toBe('POST');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call deleteTOCUserAvailableSlots with params and handle success', () => {
      let response: any;
      service.deleteTOCUserAvailableSlots(1, 'mon', 2).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Frontend/deleteTOCUserAvailableSlots?userid=1&day=mon&centreId=2`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call ManageTocSlots with payload and handle success', () => {
      let response: any;
      const payload = [{ slot: 1 }];
      service.ManageTocSlots(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Frontend/ManageTocSlots`);
      expect(req.request.method).toBe('POST');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call getAllMasterStatus and handle success', () => {
      let response: any;
      service.getAllMasterStatus().subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SubscriptionPlans/getAllMasterStatus`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call GetAllDayCareWithInRadius with params and handle success', () => {
      let response: any;
      service.GetAllDayCareWithInRadius(10.5, 20.5, 5).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Frontend/GetAllDayCareWithInRadius?lat=10.5&lng=20.5&radius=5`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });
  });

  describe('Subject Event Methods', () => {
    it('should emit on hideModalSubject when hideProfileModal is called', (done) => {
      service.hideModal$.subscribe(() => {
        expect(true).toBeTrue();
        done();
      });
      service.hideProfileModal();
    });

    it('should emit on refreshSubject when refreshTocSubject is called', (done) => {
      service.refresh$.subscribe(() => {
        expect(true).toBeTrue();
        done();
      });
      service.refreshTocSubject();
    });

    it('should emit on refreshSidebarSubject when triggerSidebarRefresh is called', (done) => {
      service.refreshSidebar$.subscribe(val => {
        if (val) {
          expect(val).toBeTrue();
          done();
        }
      });
      service.triggerSidebarRefresh();
    });
  });
});
