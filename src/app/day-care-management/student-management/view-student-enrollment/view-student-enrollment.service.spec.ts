import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ViewStudentEnrollmentService } from './view-student-enrollment.service';
import { environment } from '../../../../environments/environment';

describe('ViewStudentEnrollmentService', () => {
  let service: ViewStudentEnrollmentService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ViewStudentEnrollmentService]
    });
    service = TestBed.inject(ViewStudentEnrollmentService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call getStudent with params and handle success', () => {
      service.getStudent(1).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/getStudentsByDayCareID?daycareID=1`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call getStudentParentDetailsByStudentID with params and handle error (404)', () => {
      let errResp: any;
      service.getStudentParentDetailsByStudentID(99).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/getStudentParentDetailsByStudentID?studentID=99`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      expect(errResp.status).toBe(404);
    });

    it('should call getClassList with params and handle success', () => {
      service.getClassList(1, 2).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Classroom/getClassListDropdownByAgeGroup?centreID=1&ageGroupID=2`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call getSectionList with params and handle error (500)', () => {
      let errResp: any;
      service.getSectionList(5).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Classroom/getSectionByClassID?classID=5`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
      expect(errResp.status).toBe(500);
    });

    it('should call studentClassAssignment with payload and handle success', () => {
      const payload = { test: 123 };
      service.studentClassAssignment(payload).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/studentClassAssignment`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({});
    });

    it('should call assignTeacherForClass with payload and handle error (400)', () => {
      let errResp: any;
      service.assignTeacherForClass({}).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/assignTeacherForClass`);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
      expect(errResp.status).toBe(400);
    });

    it('should call getDayCarefortermsconditionsByCentreAdminID with params and handle success', () => {
      service.getDayCarefortermsconditionsByCentreAdminID(10).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/getDayCarefortermsconditionsByCentreAdminID?id=10`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call getTeacherStatusbyId with params and handle network error (0)', () => {
      let errResp: any;
      service.getTeacherStatusbyId(100).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/getTeacherStatusbyId?Id=100`);
      req.error(new ProgressEvent('Network Timeout'));
      expect(errResp.status).toBe(0);
    });
  });
});
