import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ManageStudentService } from './manage-student.service';
import { environment } from '../../../../environments/environment';

describe('ManageStudentService', () => {
  let service: ManageStudentService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ManageStudentService]
    });
    service = TestBed.inject(ManageStudentService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call manageStudentEnrollment with payload and handle success', () => {
      const payload = { test: 123 };
      service.manageStudentEnrollment(payload).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/manageStudentEnrollment`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({});
    });

    it('should handle getClassesByAgeGroup error (400)', () => {
      let errResp: any;
      service.getClassesByAgeGroup(1, 2).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Classroom/getClassListDropdownByAgeGroup?CentreID=1&AgeGroupID=2`);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
      expect(errResp.status).toBe(400);
    });

    it('should call getDaycareStudentList with params and handle success', () => {
      service.getDaycareStudentList(1, 'search', 2, 3, 4, 'type').subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/getChildrenListByCentreID?id=1&searchItem=search&userRoleId=2&userId=3&classId=4&type=type`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call activeInactiveEnrolledStudent and handle error (500)', () => {
      let errResp: any;
      service.activeInactiveEnrolledStudent(5).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/activeInactiveEnrolledStudent?ID=5`);
      req.flush('Server Error', { status: 500, statusText: 'Error' });
      expect(errResp.status).toBe(500);
    });

    it('should call downloadBulkUploadFormatSheet with params and handle success', () => {
      service.downloadBulkUploadFormatSheet(1, 2).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/downloadBulkUploadSheetForStudent?centreId=1&LoginUserID=2`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call uploadBulkStudent with payload and params and handle success', () => {
      const payload = { file: 'test' };
      service.uploadBulkStudent(payload, 1, 2).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/uploadBulkStudent?centreID=1&LoginUserID=2`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({});
    });

    it('should call manageParent with payload and params and handle success', () => {
      const payload = { parent: 'test' };
      service.manageParent(payload, 10).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/manageParent?studentID=10`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({});
    });

    it('should call sendMailToParentAndTeacherForPassword and handle success', () => {
      service.sendMailToParentAndTeacherForPassword(100).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SubscriptionPayment/sendMailToParentAndTeacherForPassword?parentId=100`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call GetAllAgeGroup and handle network error (0)', () => {
      let errResp: any;
      service.GetAllAgeGroup(10).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/getAllAgeGroupByCentreID?CentreID=10`);
      req.error(new ProgressEvent('Timeout'));
      expect(errResp.status).toBe(0);
    });

    it('should call getDayCareCentreDetails and handle success', () => {
      service.getDayCareCentreDetails(1).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/getDayCareCentreDetailsByCenterID?centreID=1`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call getDayCareCentreClassDetails and handle success', () => {
      service.getDayCareCentreClassDetails(2).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/getDayCareCentreClassDetailsByClassID?classID=2`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call checkEmailExistsForEnrollmentRequest and handle error (404)', () => {
      let errResp: any;
      service.checkEmailExistsForEnrollmentRequest('test@test.com').subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Frontend/checkEmailExistsForEnrollmentRequest?Email=test@test.com`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      expect(errResp.status).toBe(404);
    });
  });
});
