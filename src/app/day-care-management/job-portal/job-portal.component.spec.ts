import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JobPortalComponent } from './job-portal.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
import { JobPortalService } from './job-portal.service';
import { ToastrService } from 'ngx-toastr';
import { JobPortalServiceService } from '../job-portal-details/job-portal-service.service';
import { ProfileService } from '../../common-component/profile/profile.service';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA, ElementRef } from '@angular/core';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

describe('JobPortalComponent', () => {
  let component: JobPortalComponent;
  let fixture: ComponentFixture<JobPortalComponent>;

  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockJobPortalService: jasmine.SpyObj<JobPortalService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockJobPortalDetailService: jasmine.SpyObj<JobPortalServiceService>;
  let mockProfileService: jasmine.SpyObj<ProfileService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'check']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockJobPortalService = jasmine.createSpyObj('JobPortalService', [
      'manageJobsPosting',
      'getAvaiableJobPostsCount',
      'getJobType',
      'UpgradeJobPostingAfterPayment',
      'getAllJobPostPlans',
    ]);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);
    mockJobPortalDetailService = jasmine.createSpyObj('JobPortalServiceService', ['getJobByID']);
    mockProfileService = jasmine.createSpyObj('ProfileService', ['getProfileData']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'jobPostCount') return '5';
      if (key === 'UserInfo') {
        return JSON.stringify({
          result: {
            centreID: 10,
          },
        });
      }
      if (key === 'UserId') return '101';
      return '';
    });

    mockJobPortalService.getJobType.and.returnValue(
      of({
        message: 'OK',
        result: [
          { jobType: 'Full Time' },
          { jobType: 'Part Time' },
          { jobType: 'TOC' },
        ],
      })
    );
    mockJobPortalService.getAvaiableJobPostsCount.and.returnValue(
      of({
        message: 'Success',
        result: { count: 3 },
      })
    );

    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal'),
      prop: jasmine.createSpy('prop'),
    });

    await TestBed.configureTestingModule({
      imports: [JobPortalComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        DatePipe,
        { provide: CookieService, useValue: mockCookieService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: JobPortalService, useValue: mockJobPortalService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: JobPortalServiceService, useValue: mockJobPortalDetailService },
        { provide: ProfileService, useValue: mockProfileService },
        { provide: Router, useValue: mockRouter },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(JobPortalComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(JobPortalComponent);
    component = fixture.componentInstance;
    component.jobType = { nativeElement: { checked: false } } as ElementRef;
  });

  it('should create JobPortalComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize jobsForm with controls', () => {
      expect(component.jobsForm.contains('jobTitle')).toBeTrue();
      expect(component.jobsForm.contains('jobDescription')).toBeTrue();
      expect(component.jobsForm.contains('jobLocation')).toBeTrue();
      expect(component.jobsForm.contains('employmentType')).toBeTrue();
      expect(component.jobsForm.contains('applicationDeadline')).toBeTrue();
      expect(component.jobsForm.contains('vacancyCount')).toBeTrue();
    });

    it('should initialize upgrade forms', () => {
      expect(component.UpgradeJobPostingsPaymentForm.contains('jobPostingCount')).toBeTrue();
      expect(component.UpgradeJobPostPlanForm.contains('jobPostPlanID')).toBeTrue();
    });
  });

  describe('ngOnInit & Job Types', () => {
    it('should read cookies and fetch job types and available posts on init', async () => {
      await component.ngOnInit();

      expect(component.jobPostCount).toBe(5);
      expect(component.centerID).toBe(10);
      expect(component.userId).toBe(101);
      expect(mockJobPortalService.getJobType).toHaveBeenCalled();
      expect(mockJobPortalService.getAvaiableJobPostsCount).toHaveBeenCalledWith(10);
      expect(component.jobTypeList.length).toBe(2); // TOC filtered out
      expect(component.selectedType).toBe('TOC');
    });
  });

  describe('Type selection & Validation', () => {
    it('should set TOC type and patch employmentType to 3', () => {
      component.setType('TOC');
      expect(component.isTOC).toBeTrue();
      expect(component.jobsForm.value.employmentType).toBe(3);

      component.setType('Full Time');
      expect(component.isTOC).toBeFalse();
    });

    it('should sanitize input with onInputValidation', () => {
      const event = { target: { value: '123Valid Description!' } } as any;
      component.onInputValidation(event, 'description');
      expect(component.jobsForm.value.jobDescription).toBe('Valid Description');
    });

    it('should block minus and e keys in blockMinusKey', () => {
      const eventMinus = { key: '-', preventDefault: jasmine.createSpy('preventDefault') } as any;
      component.blockMinusKey(eventMinus);
      expect(eventMinus.preventDefault).toHaveBeenCalled();

      const eventE = { key: 'e', preventDefault: jasmine.createSpy('preventDefault') } as any;
      component.blockMinusKey(eventE);
      expect(eventE.preventDefault).toHaveBeenCalled();
    });

    it('should validate whitespace with noWhitespaceValidator', () => {
      const validator = component.noWhitespaceValidator();
      const controlInvalid = { value: '   ' } as any;
      expect(validator(controlInvalid)).toEqual({ whitespace: true });

      const controlValid = { value: 'Valid Title' } as any;
      expect(validator(controlValid)).toBeNull();
    });
  });

  describe('Submit Job Post', () => {
    it('should not submit if form is invalid', () => {
      component.jobsForm.patchValue({ jobTitle: '' });
      component.onSubmit();
      expect(mockJobPortalService.manageJobsPosting).not.toHaveBeenCalled();
    });

    it('should submit successfully when form and salary are valid', () => {
      component.JobPortalDetailsComponent = {
        getAllJobPostings: jasmine.createSpy('getAllJobPostings'),
      } as any;

      component.jobsForm.patchValue({
        jobTitle: 'ECE Educator',
        jobDescription: 'Leading infant room curriculum and fun activities',
        jobLocation: 'Vancouver',
        employmentType: 3,
        applicationDeadline: '2099-12-31',
        vacancyCount: 1,
        workingHours: 8,
        wages: 25,
      });

      mockJobPortalService.manageJobsPosting.and.returnValue(
        of({ message: 'Success' })
      );
      spyOn(Swal, 'fire');

      component.onSubmit();

      expect(mockJobPortalService.manageJobsPosting).toHaveBeenCalled();
      expect(Swal.fire).toHaveBeenCalledWith('Job Added successfully!', '', 'success');
      expect(component.JobPortalDetailsComponent.getAllJobPostings).toHaveBeenCalledWith('active');
    });

    it('should alert if deadline is smaller than current date', () => {
      component.jobsForm.patchValue({
        jobTitle: 'ECE Educator',
        jobDescription: 'Description here',
        jobLocation: 'Vancouver',
        employmentType: 3,
        applicationDeadline: '2020-01-01',
        vacancyCount: 1,
        workingHours: 8,
        wages: 25,
      });
      spyOn(Swal, 'fire');

      component.onSubmit();

      expect(Swal.fire).toHaveBeenCalledWith(
        jasmine.objectContaining({
          icon: 'error',
          title: 'Validating Future Dates',
        })
      );
    });
  });

  describe('Edit & Reuse Job Posts', () => {
    it('should patch form when editing a job with onEdit', async () => {
      mockJobPortalDetailService.getJobByID.and.returnValue(
        of({
          message: 'OK',
          result: [
            {
              jobTitle: 'Existing Job',
              jobDescription: 'Existing description',
              jobLocation: 'Downtown',
              employmentType: 3,
              salary: 3000,
              applicationDeadline: '2026-11-15T00:00:00',
              vacancyCount: 2,
              wages: 30,
              workingHours: 7,
              isMonthlySalary: true,
            },
          ],
        }) as any
      );

      await component.onEdit(99);

      expect(component.isEditMode).toBeTrue();
      expect(component.jobsForm.value.jobTitle).toBe('Existing Job');
      expect(component.jobsForm.value.workingHours).toBe(7);
    });

    it('should reuse job post if available count > 0', async () => {
      component.availableJobPostCount = { count: 2 };
      mockJobPortalDetailService.getJobByID.and.returnValue(
        of({
          message: 'OK',
          result: [
            {
              jobTitle: 'Reused Job',
              jobDescription: 'Reused description',
              jobLocation: 'Richmond',
              employmentType: 3,
              applicationDeadline: '2026-12-01T00:00:00',
              vacancyCount: 1,
              workingHours: 8,
              isMonthlySalary: true,
            },
          ],
        }) as any
      );

      await component.reUseJobPost({ id: 50 });

      expect(component.jobsForm.value.jobTitle).toBe('Reused Job');
      expect(component.isEditMode).toBeFalse();
    });
  });

  describe('Upgrade Job Postings Payment', () => {
    it('should open upgrade payment modal with OpenPaymentUpgradeModal', () => {
      component.OpenPaymentUpgradeModal();
      expect(component.TotalAmountToShow).toBe(0);
      expect((window as any).$).toHaveBeenCalledWith('#paymentForJobPostingModal');
    });

    it('should calculate amount when typing count onTypingJobPostingCount', () => {
      component.jobPostCount = 10;
      const event = { target: { value: '3' } };

      component.onTypingJobPostingCount(event);

      expect(component.TotalAmountToShow).toBe(15); // 3 * 5
      expect(component.ShowAmountField).toBeTrue();
      expect(component.limitCrossOfJobPostingCount).toBeFalse();
    });

    it('should submit upgrade payment successfully in CalculateJobPostingAmount', () => {
      component.UpgradeJobPostingsPaymentForm.patchValue({
        jobPostingCount: 2,
        AmountToPay: 10,
      });
      component.jobPostCount = 5;
      mockJobPortalService.UpgradeJobPostingAfterPayment.and.returnValue(
        of({ message: 'Success' })
      );

      component.CalculateJobPostingAmount();

      expect(mockJobPortalService.UpgradeJobPostingAfterPayment).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Job postings upgraded successfully');
    });
  });
});
