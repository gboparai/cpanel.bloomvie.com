import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JobsAppliedComponent } from './jobs-applied.component';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { JobPortalServiceService } from '../job-portal-details/job-portal-service.service';
import { ViewStudentEnrollmentService } from '../student-management/view-student-enrollment/view-student-enrollment.service';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { ClassroomDetailsService } from '../classroom-management/classroom-details/classroom-details.service';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '../../common-component/common.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

describe('JobsAppliedComponent', () => {
  let component: JobsAppliedComponent;
  let fixture: ComponentFixture<JobsAppliedComponent>;

  let mockJobPortalService: jasmine.SpyObj<JobPortalServiceService>;
  let mockViewStudentService: jasmine.SpyObj<ViewStudentEnrollmentService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockClassroomService: jasmine.SpyObj<ClassroomDetailsService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;

  beforeEach(async () => {
    mockJobPortalService = jasmine.createSpyObj('JobPortalServiceService', [
      'getAppliedJobPostings',
      'getAppliedJobPosting',
      'getDaycareCentreJobPosting',
      'manageApproval',
    ]);
    mockViewStudentService = jasmine.createSpyObj('ViewStudentEnrollmentService', [
      'assignTeacherForClass',
      'getSectionList',
    ]);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);
    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'check']);
    mockClassroomService = jasmine.createSpyObj('ClassroomDetailsService', ['getClassRoom']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['trigger']);

    mockCookieService.get.and.returnValue(
      JSON.stringify({
        result: {
          id: 101,
          centreID: 10,
          userRoleID: 3,
        },
      })
    );

    mockJobPortalService.getAppliedJobPostings.and.returnValue(
      of({ message: 'ok', result: [{ id: 1, jobTitle: 'Educator' }] })
    );
    mockJobPortalService.getAppliedJobPosting.and.returnValue(
      of({
        message: 'ok',
        result: [
          { teacherId: 50, candidateName: 'John Smith', status: 'Pending' },
        ],
      })
    );
    mockJobPortalService.getDaycareCentreJobPosting.and.returnValue(
      of({ message: 'ok', result: [{ id: 10, title: 'Job 10' }] })
    );

    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal'),
      tab: jasmine.createSpy('tab'),
    });

    await TestBed.configureTestingModule({
      imports: [JobsAppliedComponent, ReactiveFormsModule, FormsModule],
      providers: [
        FormBuilder,
        { provide: JobPortalServiceService, useValue: mockJobPortalService },
        { provide: ViewStudentEnrollmentService, useValue: mockViewStudentService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: CookieService, useValue: mockCookieService },
        { provide: ClassroomDetailsService, useValue: mockClassroomService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: CommonService, useValue: mockCommonService },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ jobId: '10' }),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(JobsAppliedComponent, {
        set: {
          imports: [ReactiveFormsModule, FormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(JobsAppliedComponent);
    component = fixture.componentInstance;
  });

  it('should create JobsAppliedComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization & Status Classes', () => {
    it('should read cookies, parse user info and load initial data on init', async () => {
      await component.ngOnInit();

      expect(component.UserID).toBe(101);
      expect(component.centerID).toBe(10);
      expect(component.userRoleID).toBe(3);
      expect(mockJobPortalService.getAppliedJobPostings).toHaveBeenCalled();
      expect(mockJobPortalService.getDaycareCentreJobPosting).toHaveBeenCalledWith(10);
    });

    it('should return correct status classes', () => {
      expect(component.getStatusClass('Pending')).toBe('status-pending');
      expect(component.getStatusClass('Shortlisted')).toBe('status-shortlisted');
      expect(component.getStatusClass('Approved')).toBe('status-approved');
      expect(component.getStatusClass('Reject')).toBe('status-rejected');
      expect(component.getStatusClass('OnHold')).toBe('status-onhold');
      expect(component.getStatusClass('Unknown')).toBe('');
    });
  });

  describe('Blob and Resume helper functions', () => {
    it('should convert base64 to Blob correctly', () => {
      const b64 = btoa('test file data');
      const blob = component.base64ToBlob(b64, 'application/pdf');
      expect(blob).toBeDefined();
      expect(blob.type).toBe('application/pdf');
    });

    it('should return empty blob for empty or invalid base64 string', () => {
      const blob = component.base64ToBlob('');
      expect(blob.size).toBe(0);
    });

    it('should download resume via object URL', () => {
      spyOn(URL, 'createObjectURL').and.returnValue('blob:dummy');
      spyOn(URL, 'revokeObjectURL');
      const b64 = btoa('test');

      component.downloadResume(b64, 'resume.pdf');

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:dummy');
    });
  });

  describe('Status Changes & Approvals', () => {
    it('should delegate onStatusChange to respective handlers', () => {
      spyOn(component, 'approveShortlist');
      component.onStatusChange(50, 'Shortlisted', 101);
      expect(component.approveShortlist).toHaveBeenCalledWith(50, 'received', 101);

      spyOn(component, 'rejectShortlist');
      component.onStatusChange(50, 'Reject', 101);
      expect(component.rejectShortlist).toHaveBeenCalledWith(50, 'daycareReject', 101, undefined, undefined);

      spyOn(component, 'approveOnHold');
      component.onStatusChange(50, 'OnHold', 101);
      expect(component.approveOnHold).toHaveBeenCalledWith(50, 'shortlisted', 101);

      spyOn(component, 'approveDaycare');
      component.onStatusChange(50, 'Approved', 101);
      expect(component.approveDaycare).toHaveBeenCalledWith(50, 'approved', 101, undefined);
    });

    it('should call manageApproval and notify user on ApprovedReject', () => {
      mockJobPortalService.manageApproval.and.returnValue(
        of({ message: 'Success' })
      );
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));

      component.ApprovedReject(50, 9, '', 'received', 101);

      expect(mockJobPortalService.manageApproval).toHaveBeenCalled();
      expect(mockSpinner.hide).toHaveBeenCalled();
      expect(Swal.fire).toHaveBeenCalled();
    });
  });

  describe('Class Assignment & Dropdowns', () => {
    it('should reset dropdowns with resetDropdown', () => {
      component.sectionList = [1];
      component.classList = [2];
      component.selectedTeacherName = 'John';
      component.selectedClass = 1;

      component.resetDropdown();

      expect(component.sectionList).toEqual([]);
      expect(component.classList).toEqual([]);
      expect(component.selectedTeacherName).toBe('');
      expect(component.selectedClass).toBeNull();
    });

    it('should submit teacher class assignment successfully', () => {
      component.assignClassForm.patchValue({
        classID: 1,
        teacherID: 50,
      });
      mockViewStudentService.assignTeacherForClass.and.returnValue(
        of({ message: 'OK' })
      );

      component.onSubmit();

      expect(mockViewStudentService.assignTeacherForClass).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Class Assigned Successfully !', 'Success');
    });

    it('should fetch section list using getSectionList', () => {
      mockViewStudentService.getSectionList.and.returnValue(
        of({ message: 'OK', result: [{ id: 101, sectionName: 'A' }] })
      );

      component.getSectionList({ id: 1 });

      expect(mockViewStudentService.getSectionList).toHaveBeenCalledWith(1);
      expect(component.sectionList.length).toBe(1);
    });
  });
});
