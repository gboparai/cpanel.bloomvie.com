import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ManageStaffService } from './manage-staff.service';
import { environment } from '../../../../environments/environment';

describe('ManageStaffService', () => {
  let service: ManageStaffService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ManageStaffService]
    });
    service = TestBed.inject(ManageStaffService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call getStaffAccToNameAndEmailSearch with params and handle success', () => {
      service.getStaffAccToNameAndEmailSearch(1, 2).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/getStaffAccToNameAndEmailSearch?NameOrEmail=1&centreID=2`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should handle getStaffAccToNameAndEmailSearch error (404)', () => {
      let errResp: any;
      service.getStaffAccToNameAndEmailSearch(9, 9).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/getStaffAccToNameAndEmailSearch?NameOrEmail=9&centreID=9`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      expect(errResp.status).toBe(404);
    });

    it('should call getCentreStaffList with params and handle success', () => {
      service.getCentreStaffList(1, 'john', 'type', true).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/getCentreStaffList?centreID=1&NameOrEmail=john&type=type&IsOnlystaff=true`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call getClassListByTeacherID with params and handle success', () => {
      service.getClassListByTeacherID(1, 2).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Classroom/getClassListByTeacher&CentreID?id=1&centreId=2`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call getClassListByuserRoleID with params and handle success', () => {
      service.getClassListByuserRoleID(1, 2, 3).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Classroom/getClassListByuserRoleID?id=1&centreId=2&userRoleId=3`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call getDaycareClasses with params and handle success', () => {
      service.getDaycareClasses(10).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Classroom/getDaycareClassListDropdown?ID=10`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call getDaycareClassSections with params and handle success', () => {
      service.getDaycareClassSections(5).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Classroom/getDaycareClassSectionListDropdown?ID=5`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call manageStaff with payload and params and handle success', () => {
      const payload = { test: 123 };
      service.manageStaff(payload, 2).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/ManageStaffAsync?CreatedByRoleID=2`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({});
    });

    it('should call activeInactiveStaff and handle error (500)', () => {
      let errResp: any;
      service.activeInactiveStaff(5).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/activeInactiveCentreUser?ID=5`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
      expect(errResp.status).toBe(500);
    });

    it('should call uploadBulkStaff with payload and params and handle success', () => {
      const payload = { file: 'data' };
      service.uploadBulkStaff(payload, 10).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/uploadBulkStaff?centreID=10`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({});
    });

    it('should call downloadBulkUploadSheetFormat and handle network timeout (0)', () => {
      let errResp: any;
      service.downloadBulkUploadSheetFormat(5).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/downloadBulkUploadSheetForStaff?centreId=5`);
      req.error(new ProgressEvent('Network error'));
      expect(errResp.status).toBe(0);
    });

    it('should call isClassOrSectionAssigned with params and handle success', () => {
      service.isClassOrSectionAssigned(1, 2).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/isClassOrSectionAssigned?classID=1&teacherID=2`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call assignedClassToNewTeacher with params and handle success', () => {
      service.assignedClassToNewTeacher(1, 2, 'type').subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Classroom/assignedClassToNewTeacher?oldTeacherID=1&newTeacherID=2&Type=type`);
      expect(req.request.method).toBe('PUT');
      req.flush({});
    });

    it('should call TeacherClassSectionAssignment with params and handle success', () => {
      service.TeacherClassSectionAssignment(1, 2).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Classroom/TeacherClassSectionAssignment?teacherID=1&classID=2`);
      expect(req.request.method).toBe('PUT');
      req.flush({});
    });

    it('should call AssignDaycareToCounsellorAfterActivate with payload and params and handle success', () => {
      const payload = [1, 2, 3];
      service.AssignDaycareToCounsellorAfterActivate(1, 2, payload).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/AssignDaycareToCounsellorAfterActivate?CreatedByID=1&CounsellorID=2`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);
      req.flush({});
    });
  });
});
