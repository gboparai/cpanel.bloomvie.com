import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ManageStudentService } from './manage-student.service';
import { environment } from '../../../../environments/environment';
import {
  AddStudentEnrollmentRequest,
  StudentInfo,
  StudentListResponse,
  ClassroomDropdownItem,
  ApiResponse,
} from '../../../models/api.types';

describe('ManageStudentService', () => {
  let service: ManageStudentService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ManageStudentService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call manageStudentEnrollment with AddStudentEnrollmentRequest payload', () => {
    let result: ApiResponse<any> | undefined;
    const enrollPayload: AddStudentEnrollmentRequest = {
      id: 0,
      firstName: 'Oliver',
      lastName: 'Brown',
      centreID: 101,
      ageGroupID: 1,
      gender: 'Male',
      dob: '2023-01-15',
      parent: {
        id: 0,
        firstName: 'Emma',
        lastName: 'Brown',
        email: 'emma@example.com',
        mobile: '5551234567',
        relation: 'Mother',
      },
    };

    service.manageStudentEnrollment(enrollPayload).subscribe((res) => {
      result = res;
    });

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/DayCareCentreUser/manageStudentEnrollment`
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(enrollPayload);

    req.flush({ message: 'Success', activity: 'Student enrolled successfully' });
    expect(result?.message).toBe('Success');
  });

  it('should call getClassesByAgeGroup and return ClassroomDropdownItem list', () => {
    let result: ApiResponse<ClassroomDropdownItem[]> | undefined;
    service.getClassesByAgeGroup(101, 2).subscribe((res) => {
      result = res;
    });

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Classroom/getClassListDropdownByAgeGroup?CentreID=101&AgeGroupID=2`
    );
    expect(req.request.method).toBe('GET');

    const mockResponse: ApiResponse<ClassroomDropdownItem[]> = {
      message: 'Success',
      result: [{ id: 10, className: 'Toddlers A' }],
    };
    req.flush(mockResponse);

    expect(result?.result?.length).toBe(1);
    expect(result?.result?.[0].className).toBe('Toddlers A');
  });

  it('should call getDaycareStudentList and return StudentListResponse', () => {
    let result: StudentListResponse | undefined;
    service.getDaycareStudentList(101, 'oliver', 3, 50, 0, 'active').subscribe((res) => {
      result = res;
    });

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/DayCareCentreUser/getChildrenListByCentreID?id=101&searchItem=oliver&userRoleId=3&userId=50&classId=0&type=active`
    );
    expect(req.request.method).toBe('GET');

    const mockResponse: StudentListResponse = {
      message: 'Success',
      result: [{ id: 1, firstName: 'Oliver', lastName: 'Brown', isActive: true }],
    };
    req.flush(mockResponse);

    expect(result?.result?.length).toBe(1);
    expect(result?.result?.[0].firstName).toBe('Oliver');
  });
});
