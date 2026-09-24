import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DcAppointmentsListService } from './dc-appointments-list.service';
import { environment } from '../../../environments/environment';

describe('DcAppointmentsListService', () => {
  let service: DcAppointmentsListService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DcAppointmentsListService]
    });
    service = TestBed.inject(DcAppointmentsListService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call getDayCareAppointments with params and handle success', () => {
      let response: any;
      service.getDayCareAppointments(1, 'search', 5, 30).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SlotTimeTable/GetDayCareAppointments?statusID=1&searchItem=search&regionHours=5&regionMinutes=30`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle getDayCareAppointments network error (0)', () => {
      let errResp: any;
      service.getDayCareAppointments(1, 'search', 5, 30).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SlotTimeTable/GetDayCareAppointments?statusID=1&searchItem=search&regionHours=5&regionMinutes=30`);
      req.error(new ProgressEvent('Network Error'));
      expect(errResp.status).toBe(0);
    });

    it('should call getIntersetedUserByID with params and handle success', () => {
      let response: any;
      service.getIntersetedUserByID(10, 5, 30).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SlotTimeTable/getInterestedDayCareById?id=10&regionHours=5&regionMinutes=30`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call ManageCousellor with payload and handle success', () => {
      let response: any;
      const payload = { obj: 'test' };
      service.ManageCousellor(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SlotTimeTable/manageForDayCareInterestedUsers`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle ManageCousellor error (400)', () => {
      let errResp: any;
      service.ManageCousellor({}).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SlotTimeTable/manageForDayCareInterestedUsers`);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
      expect(errResp.status).toBe(400);
    });

    it('should call changeDayCareRequest with params and handle success', () => {
      let response: any;
      service.changeDayCareRequest(1).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SlotTimeTable/changeRequestOfDayCareUser?id=1`);
      expect(req.request.method).toBe('PUT');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call SendEmailAfterMeeting with params and handle success', () => {
      let response: any;
      service.SendEmailAfterMeeting(1, 'plan1', 'enc1', 'enc2', '10', 'type', 'yes', '5', '5').subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SlotTimeTable/SendEmailAfterMeeting?id=1&PlanID=plan1&planencryptID=enc1&dayCareUserencryptID=enc2&DiscountAmount=10&DayCareType=type&discount=yes&trialDays=5&trialDaysCount=5`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call getSubscriptionPlanByUserId with params and handle success', () => {
      let response: any;
      service.getSubscriptionPlanByUserId(100).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Frontend/getSubscriptionplanByUserId?Id=100`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle getSubscriptionPlanByUserId error (404)', () => {
      let errResp: any;
      service.getSubscriptionPlanByUserId(999).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Frontend/getSubscriptionplanByUserId?Id=999`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      expect(errResp.status).toBe(404);
    });

    it('should call completeDaycareMeeting with params and handle success', () => {
      let response: any;
      service.completeDaycareMeeting(5).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SlotTimeTable/maketheMeetingCompleteByDayCareId?id=5`);
      expect(req.request.method).toBe('PUT');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call CheckInterestedEmailExist with params and handle success', () => {
      let response: any;
      service.CheckInterestedEmailExist('test@test.com').subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/User/CheckInterestedEmailExist?email=test@test.com`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call getZoomMeetingLink with payload and handle success', () => {
      let response: any;
      const payload = { zoom: true };
      service.getZoomMeetingLink(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Zoom/CreateZoomMeeting`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call dayCareMeetingJoined with params and handle success', () => {
      let response: any;
      service.dayCareMeetingJoined(1).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SlotTimeTable/dayCareMeetingJoined?id=1`);
      expect(req.request.method).toBe('PUT');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call getFilteredData with payload and handle success', () => {
      let response: any;
      const payload = { filter: true };
      service.getFilteredData(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SlotTimeTable/getFilteredData`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle getFilteredData error (500)', () => {
      let errResp: any;
      service.getFilteredData({}).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SlotTimeTable/getFilteredData`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
      expect(errResp.status).toBe(500);
    });

    it('should call getAllCounsellorBySlotID with params and handle success', () => {
      let response: any;
      service.getAllCounsellorBySlotID(10).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SlotTimeTable/getAllCounsellorBySlotID?slotID=10`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call dayCareAssignmentToCounsellor with params and handle success', () => {
      let response: any;
      service.dayCareAssignmentToCounsellor(1, 2).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/User/dayCareAssignmentToCounsellor?CounsellorID=1&centreID=2`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });
  });
});
