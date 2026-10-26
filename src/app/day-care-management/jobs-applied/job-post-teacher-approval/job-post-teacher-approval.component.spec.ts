import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JobPostTeacherApprovalComponent } from './job-post-teacher-approval.component';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { JobPortalServiceService } from '../../job-portal-details/job-portal-service.service';
import { ViewStudentEnrollmentService } from '../../student-management/view-student-enrollment/view-student-enrollment.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import CryptoJS from 'crypto-js';
import Swal from 'sweetalert2';

describe('JobPostTeacherApprovalComponent', () => {
  let component: JobPostTeacherApprovalComponent;
  let fixture: ComponentFixture<JobPostTeacherApprovalComponent>;

  let mockJobPortalService: jasmine.SpyObj<JobPortalServiceService>;
  let mockViewStudentService: jasmine.SpyObj<ViewStudentEnrollmentService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const secretKey = 'encrypt!135790';
  const encTeacherID = CryptoJS.AES.encrypt('105', secretKey).toString();
  const encCentreID = CryptoJS.AES.encrypt('10', secretKey).toString();

  beforeEach(async () => {
    mockJobPortalService = jasmine.createSpyObj('JobPortalServiceService', [
      'ValidateToken',
      'manageTeacherApproval',
    ]);
    mockViewStudentService = jasmine.createSpyObj('ViewStudentEnrollmentService', [
      'getDayCarefortermsconditionsByCentreAdminID',
      'getTeacherStatusbyId',
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockJobPortalService.ValidateToken.and.returnValue(
      of({ message: 'OK' })
    );
    mockViewStudentService.getTeacherStatusbyId.and.returnValue(
      of({
        message: 'ok',
        result: {
          statusID: 10,
          jobPostID: 7,
        },
      })
    );
    mockViewStudentService.getDayCarefortermsconditionsByCentreAdminID.and.returnValue(
      of({
        message: 'OK',
        result: [
          {
            jobPostId: 7,
            workingDays: [{ startTime: '09:00:00', endTime: '17:00:00' }],
          },
        ],
      })
    );

    await TestBed.configureTestingModule({
      imports: [JobPostTeacherApprovalComponent],
      providers: [
        FormBuilder,
        { provide: JobPortalServiceService, useValue: mockJobPortalService },
        { provide: ViewStudentEnrollmentService, useValue: mockViewStudentService },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({
              Token: 'valid-token',
              id: encTeacherID,
              CentreID: encCentreID,
            }),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(JobPostTeacherApprovalComponent, {
        set: {
          imports: [],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(JobPostTeacherApprovalComponent);
    component = fixture.componentInstance;
  });

  it('should create JobPostTeacherApprovalComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit & Token Validation', () => {
    it('should decrypt teacherID and centreID and validate token on init', () => {
      component.ngOnInit();

      expect(component.teacherID).toBe('105');
      expect(component.centreid).toBe('10');
      expect(mockJobPortalService.ValidateToken).toHaveBeenCalledWith('105', 'valid-token');
      expect(component.isToken).toBeTrue();
      expect(mockViewStudentService.getTeacherStatusbyId).toHaveBeenCalledWith('105');
      expect(mockViewStudentService.getDayCarefortermsconditionsByCentreAdminID).toHaveBeenCalledWith(10);
    });

    it('should handle token validation failure', () => {
      mockJobPortalService.ValidateToken.and.returnValue(
        of({ message: 'Invalid' })
      );

      component.tokenMatch();

      expect(component.isToken).toBeFalse();
      expect(mockViewStudentService.getTeacherStatusbyId).toHaveBeenCalledWith('105');
    });
  });

  describe('Terms Conditions & Status', () => {
    it('should set viewThankYou to true if teacher statusID is 18', () => {
      mockViewStudentService.getTeacherStatusbyId.and.returnValue(
        of({
          message: 'ok',
          result: {
            statusID: 18,
            jobPostID: 7,
          },
        })
      );

      component.getTeacherStatusbyId();

      expect(component.viewThankYou).toBeTrue();
      expect(component.teacherjobPostId).toBe(7);
    });

    it('should set viewThankYou to false if teacher statusID is 10', () => {
      mockViewStudentService.getTeacherStatusbyId.and.returnValue(
        of({
          message: 'ok',
          result: {
            statusID: 10,
            jobPostID: 7,
          },
        })
      );

      component.getTeacherStatusbyId();

      expect(component.viewThankYou).toBeFalse();
    });
  });

  describe('Approve, Reject and Cancel Actions', () => {
    it('should process approveReject upon confirmation', async () => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true } as any)
      );
      spyOn(component, 'ApprovedReject');

      await component.approveReject(1, true, 'approval');

      expect(component.viewThankYou).toBeTrue();
      expect(component.ApprovedReject).toHaveBeenCalledWith('105', 1, true, '', 'approval');
    });

    it('should submit teacher approval in ApprovedReject', () => {
      mockJobPortalService.manageTeacherApproval.and.returnValue(
        of({ message: 'Success' })
      );

      component.ApprovedReject(1, 10, true, '', 'approval');

      expect(mockJobPortalService.manageTeacherApproval).toHaveBeenCalled();
      expect(component.isToken).toBeFalse();
    });
  });
});
