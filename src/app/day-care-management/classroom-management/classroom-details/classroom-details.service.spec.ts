import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ClassroomDetailsService } from './classroom-details.service';
import { environment } from '../../../../environments/environment';

describe('ClassroomDetailsService', () => {
  let service: ClassroomDetailsService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ClassroomDetailsService],
    });
    service = TestBed.inject(ClassroomDetailsService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get sections with id and name', () => {
    service.getSections(5, 'Section A').subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Classroom/getSections?id=5&name=Section%20A`
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should post nap time data', () => {
    const payload = { studentId: 10, napDuration: 60 };
    service.manageNapTime(payload).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Classroom/manageStudentNapTime`
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ success: true });
  });

  it('should post food data', () => {
    const payload = { studentId: 10, foodType: 'Snack' };
    service.manageFood(payload).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Classroom/manageFood`
    );
    expect(req.request.method).toBe('POST');
    req.flush({ success: true });
  });

  it('should get food types and meal types', () => {
    service.getFoodType().subscribe();
    const req1 = httpTestingController.expectOne(`${environment.apiUrl}/Classroom/getFoodType`);
    expect(req1.request.method).toBe('GET');
    req1.flush([]);

    service.getMealType({ category: 'lunch' }).subscribe();
    const req2 = httpTestingController.expectOne(`${environment.apiUrl}/Classroom/getMealType`);
    expect(req2.request.method).toBe('POST');
    req2.flush([]);
  });

  it('should get student details by date range', () => {
    service.getStudentDetails(10, '2026-01-01', '2026-01-31').subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Classroom/getStudentDetailsByStudentID?studentId=10&startDate=2026-01-01&endDate=2026-01-31`
    );
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should call studentActivityImageDelete with post data', () => {
    service.studentActivityImageDelete({ imageId: 44 }).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Classroom/studentActivityImageDelete`
    );
    expect(req.request.method).toBe('POST');
    req.flush({ deleted: true });
  });

  it('should get student profile by student ID', () => {
    service.getStudentProfileByStudentID(88).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Classroom/getStudentProfileByStudentID?Id=88`
    );
    expect(req.request.method).toBe('GET');
    req.flush({ name: 'Tommy' });
  });

  it('should call getTeacherAvailability with userId and centreId', () => {
    service.getTeacherAvailability(15, 2).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Common/getTeacherAvailability?userId=15&centreId=2`
    );
    expect(req.request.method).toBe('GET');
    req.flush({ available: true });
  });

  it('should get student media request with userRoleID', () => {
    service.getStudentMediaRequest(3).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Classroom/getStudentMediaRequest?userRoleID=3`
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
