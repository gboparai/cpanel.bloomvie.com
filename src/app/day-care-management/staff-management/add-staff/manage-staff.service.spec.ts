import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ManageStaffService } from './manage-staff.service';
import { environment } from '../../../../environments/environment';
import {
  AddStaffRequest,
  StaffInfo,
  StaffListResponse,
  ClassroomDropdownItem,
  ApiResponse,
} from '../../../models/api.types';

describe('ManageStaffService', () => {
  let service: ManageStaffService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ManageStaffService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call getStaffAccToNameAndEmailSearch with params and return staff array', () => {
    let result: ApiResponse<StaffInfo[]> | undefined;
    service.getStaffAccToNameAndEmailSearch('john', 101).subscribe((res) => {
      result = res;
    });

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/DayCareCentreUser/getStaffAccToNameAndEmailSearch?NameOrEmail=john&centreID=101`
    );
    expect(req.request.method).toBe('GET');

    const mockResponse: ApiResponse<StaffInfo[]> = {
      message: 'Success',
      result: [{ id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' }],
    };
    req.flush(mockResponse);

    expect(result?.result?.length).toBe(1);
    expect(result?.result?.[0].firstName).toBe('John');
  });

  it('should call getCentreStaffList and return StaffListResponse', () => {
    let result: StaffListResponse | undefined;
    service.getCentreStaffList(101, 'jane', 'active', false).subscribe((res) => {
      result = res;
    });

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/DayCareCentreUser/getCentreStaffList?centreID=101&NameOrEmail=jane&type=active&IsOnlystaff=false`
    );
    expect(req.request.method).toBe('GET');

    const mockResponse: StaffListResponse = {
      message: 'Success',
      result: [
        { id: 2, firstName: 'Jane', userRole: 'Teacher', isActive: true },
      ],
    };
    req.flush(mockResponse);

    expect(result?.result?.length).toBe(1);
    expect(result?.result?.[0].userRole).toBe('Teacher');
  });

  it('should call getDaycareClasses and return ClassroomDropdownItem list', () => {
    let result: ApiResponse<ClassroomDropdownItem[]> | undefined;
    service.getDaycareClasses(101).subscribe((res) => {
      result = res;
    });

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Classroom/getDaycareClassListDropdown?ID=101`
    );
    expect(req.request.method).toBe('GET');

    const mockResponse: ApiResponse<ClassroomDropdownItem[]> = {
      message: 'Success',
      result: [{ id: 5, className: 'Infants A', name: 'Infants A' }],
    };
    req.flush(mockResponse);

    expect(result?.result?.length).toBe(1);
    expect(result?.result?.[0].className).toBe('Infants A');
  });

  it('should call manageStaff with AddStaffRequest payload and CreatedByRoleID param', () => {
    let result: ApiResponse<any> | undefined;
    const staffPayload: AddStaffRequest = {
      id: 0,
      firstName: 'Emily',
      lastName: 'Smith',
      email: 'emily@example.com',
      centreID: 101,
      userRoleID: 4,
      jobType: 1,
    };

    service.manageStaff(staffPayload, 3).subscribe((res) => {
      result = res;
    });

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/DayCareCentreUser/ManageStaffAsync?CreatedByRoleID=3`
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(staffPayload);

    req.flush({ message: 'Success', activity: 'Staff created successfully' });
    expect(result?.message).toBe('Success');
  });
});
