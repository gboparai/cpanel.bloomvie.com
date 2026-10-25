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
      providers: [ViewStudentEnrollmentService],
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

  it('should get students by daycareID', () => {
    service.getStudent(5).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/DayCareCentreUser/getStudentsByDayCareID?daycareID=5`
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should get student parent details by student ID', () => {
    service.getStudentParentDetailsByStudentID(10).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/DayCareCentreUser/getStudentParentDetailsByStudentID?studentID=10`
    );
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should get class list by age group', () => {
    service.getClassList(5, 2).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Classroom/getClassListDropdownByAgeGroup?centreID=5&ageGroupID=2`
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should get section list by classID', () => {
    service.getSectionList(20).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Classroom/getSectionByClassID?classID=20`
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should post studentClassAssignment', () => {
    const studentData = { studentId: 10, classId: 2 };
    service.studentClassAssignment(studentData).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/DayCareCentreUser/studentClassAssignment`
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(studentData);
    req.flush({ success: true });
  });

  it('should post assignTeacherForClass', () => {
    const teacherData = { teacherId: 3, classId: 2 };
    service.assignTeacherForClass(teacherData).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/DayCareCentreUser/assignTeacherForClass`
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(teacherData);
    req.flush({ success: true });
  });
});
