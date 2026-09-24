import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ChildRoutineService } from './child-routine.service';
import { environment } from '../../../../environments/environment';

describe('ChildRoutineService', () => {
  let service: ChildRoutineService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ChildRoutineService]
    });
    service = TestBed.inject(ChildRoutineService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call manageChildDailyRoutine with payload and handle success', () => {
      let response: any;
      const payload = { test: 123 };
      service.manageChildDailyRoutine(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/manageChildDailyRoutine`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle manageChildDailyRoutine error (400)', () => {
      let errResp: any;
      service.manageChildDailyRoutine({}).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/manageChildDailyRoutine`);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
      expect(errResp.status).toBe(400);
    });

    it('should call SubmitControlTypeAndLabelName with payload and handle success', () => {
      let response: any;
      const payload = { label: 'name' };
      service.SubmitControlTypeAndLabelName(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/SubmitControlAndLabelForm`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call GetControlAndLabelForm with params and handle success', () => {
      let response: any;
      service.GetControlAndLabelForm(1, 2).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DynamicForm/GetControlAndLabelForm?centreID=1&userID=2`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle GetControlAndLabelForm network error (0)', () => {
      let errResp: any;
      service.GetControlAndLabelForm(1, 2).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DynamicForm/GetControlAndLabelForm?centreID=1&userID=2`);
      req.error(new ProgressEvent('Network Error'));
      expect(errResp.status).toBe(0);
    });

    it('should call SubmitControlFieldAnswers with payload and handle success', () => {
      let response: any;
      const payload = { answer: 'yes' };
      service.SubmitControlFieldAnswers(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DynamicForm/SubmitControlFieldAnswers`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call submitCombinedData with payload and handle success', () => {
      let response: any;
      const payload = { all: true };
      service.submitCombinedData(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/manageChildDailyRoutineWithDynamicForm`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call getSectionByCentreID with params and handle success', () => {
      let response: any;
      service.getSectionByCentreID(10, 'url').subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DynamicForm/GetSectionByCentreID?centreID=10&url=url`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle getSectionByCentreID error (404)', () => {
      let errResp: any;
      service.getSectionByCentreID(99, 'url').subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DynamicForm/GetSectionByCentreID?centreID=99&url=url`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      expect(errResp.status).toBe(404);
    });

    it('should call SubmitSection with payload and handle success', () => {
      let response: any;
      const payload = { section: '1' };
      service.SubmitSection(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DynamicForm/SubmitSection`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call CopyIsMasterTrueSections with params and handle success', () => {
      let response: any;
      service.CopyIsMasterTrueSections(1, 2, 3).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DynamicForm/CopyIsMasterTrueSections?centreID=1&userID=2&userRoleID=3`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call getStudentLikesAndDislikes with params and handle success', () => {
      let response: any;
      service.getStudentLikesAndDislikes(10, 20).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/getStudentLikesAndDislikes?parentID=10&studentID=20`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle getStudentLikesAndDislikes error (500)', () => {
      let errResp: any;
      service.getStudentLikesAndDislikes(10, 20).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/getStudentLikesAndDislikes?parentID=10&studentID=20`);
      req.flush('Server Error', { status: 500, statusText: 'Server Error' });
      expect(errResp.status).toBe(500);
    });

    it('should call getAllPendingOnboardingStudentByCentreIDAndParentID with params and handle success', () => {
      let response: any;
      service.getAllPendingOnboardingStudentByCentreIDAndParentID(5, 6).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/getAllPendingOnboardingStudentByCentreIDAndParentID?CentreID=5&ParentID=6`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });
  });
});
