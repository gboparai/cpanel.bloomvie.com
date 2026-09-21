import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DayCareDashboardService } from './day-care-dashboard.service';
import { environment } from '../../../environments/environment';

describe('DayCareDashboardService', () => {
  let service: DayCareDashboardService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DayCareDashboardService]
    });
    service = TestBed.inject(DayCareDashboardService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call getDayCareByID with params and handle success', () => {
      service.getDayCareByID(1).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/getCentreByID?ID=1`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should handle getDayCareByID error (404)', () => {
      let errResp: any;
      service.getDayCareByID(999).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/getCentreByID?ID=999`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      expect(errResp.status).toBe(404);
    });

    it('should call getDayCareDashBoardCount with params and handle success', () => {
      service.getDayCareDashBoardCount(10).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Dashboard/getDayCareDashBoardCount?DayCareID=10`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call getEventsByDayCareId with params and handle success', () => {
      service.getEventsByDayCareId(5).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Dashboard/getEventsByDayCareId?DayCareId=5`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call getActivitesByCenterId with params and handle success', () => {
      service.getActivitesByCenterId(5).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Dashboard/getActivitesByCenterId?DayCareId=5`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call getStaffTransferedDetailsByCentreID with params and handle success', () => {
      service.getStaffTransferedDetailsByCentreID(1, 2, 'active', 'all').subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/getStaffTransferedDetailsByCentreID?centreID=1&UserRoleID=2&status=active&type=all`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call getStaffTransferedDetailsTeacherID with params and handle success', () => {
      service.getStaffTransferedDetailsTeacherID(1, 2).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/getStaffTransferedDetailsTeacherID?teacherID=1&UserRoleID=2`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call manageTransferApprovedEmployee with params and handle success', () => {
      service.manageTransferApprovedEmployee(1, 2, 3, 'reason', '2023-01-01').subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/manageTransferApprovedEmployee?employeeID=1&transferCentreID=2&statusID=3&Reason=reason&date=2023-01-01`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call getAllEventManagementType and handle success', () => {
      service.getAllEventManagementType().subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/getAllEventManagementType`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should call manageDaycareCentreEventManagment with payload and handle success', () => {
      const payload = { test: 123 };
      service.manageDaycareCentreEventManagment(payload).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/ManageDaycareCentreEventManagment`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({});
    });

    it('should call deleteEvent with params and handle success', () => {
      service.deleteEvent(1, 2).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/deleteEventByDayCareId?eventID=1&daycareID=2`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call getAllEnrollmentRequestByCentreID with params and handle error (500)', () => {
      let errResp: any;
      service.getAllEnrollmentRequestByCentreID(1, false, 'search').subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/getAllEnrollmentRequestByCentreID?CentreID=1&IsDiscountApplied=false&searchItem=search`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
      expect(errResp.status).toBe(500);
    });

    it('should call getClassListDropdownByAgeGroup with params and handle success', () => {
      service.getClassListDropdownByAgeGroup(1, 2).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Classroom/getClassListDropdownByAgeGroup?CentreID=1&AgeGroupID=2`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should call AcceptOrRejectEnrollmentRequest with payload and params and handle success', () => {
      const payload = [1, 2];
      service.AcceptOrRejectEnrollmentRequest(payload, 3, 'reason', 4).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/AcceptOrRejectEnrollmentRequest?StatusID=3&Reason=reason&ParentID=4`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);
      req.flush({});
    });

    it('should call sendPaymentEmailToParent with payload and handle success', () => {
      const payload = { data: 'test' };
      service.sendPaymentEmailToParent(payload).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/sendPaymentEmailToParent`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);
      req.flush({});
    });

    it('should call updateStripeStepCount with params and handle network error (0)', () => {
      let errResp: any;
      service.updateStripeStepCount('acct_123').subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Payment/updateStripeStepCount?accountId=acct_123`);
      req.error(new ProgressEvent('Timeout'));
      expect(errResp.status).toBe(0);
    });
  });
});
