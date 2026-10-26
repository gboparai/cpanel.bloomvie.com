import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JobPortalDetailsComponent } from './job-portal-details.component';
import { JobPortalServiceService } from './job-portal-service.service';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

describe('JobPortalDetailsComponent', () => {
  let component: JobPortalDetailsComponent;
  let fixture: ComponentFixture<JobPortalDetailsComponent>;

  let mockJobPostingService: jasmine.SpyObj<JobPortalServiceService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;

  beforeEach(async () => {
    mockJobPostingService = jasmine.createSpyObj('JobPortalServiceService', [
      'getAllJobPostings',
      'activeInActiveByID',
    ]);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);
    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'check']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);

    mockCookieService.get.and.returnValue(
      JSON.stringify({
        result: {
          centreID: 10,
        },
      })
    );
    mockJobPostingService.getAllJobPostings.and.returnValue(
      of({
        message: 'OK',
        result: [
          { id: 1, jobTitle: 'ECE Teacher', applicationDeadline: '2026-12-31' },
          { id: 2, jobTitle: 'Assistant', applicationDeadline: '2020-01-01' },
        ],
      }) as any
    );

    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      prop: jasmine.createSpy('prop'),
    });

    await TestBed.configureTestingModule({
      imports: [JobPortalDetailsComponent],
      providers: [
        { provide: JobPortalServiceService, useValue: mockJobPostingService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: CookieService, useValue: mockCookieService },
        { provide: Router, useValue: mockRouter },
        { provide: NgxSpinnerService, useValue: mockSpinner },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(JobPortalDetailsComponent, {
        set: {
          imports: [],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(JobPortalDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create JobPortalDetailsComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit & Job Postings', () => {
    it('should read centreID from cookie and fetch active job postings on init', async () => {
      await component.ngOnInit();
      expect(component.centreID).toBe(10);
      expect(component.dayCare).toBe(10);
      expect(mockJobPostingService.getAllJobPostings).toHaveBeenCalledWith(10, 'active');
      expect(component.Jobs.length).toBe(2);
    });

    it('should handle getAllJobPostings error gracefully', async () => {
      mockJobPostingService.getAllJobPostings.and.returnValue(
        throwError(() => new Error('Error fetching jobs')) as any
      );
      spyOn(console, 'error');

      await component.getAllJobPostings('active');

      expect(console.error).toHaveBeenCalled();
      expect(component.skeletonShow).toBe('');
    });
  });

  describe('Deadline and Helper checks', () => {
    it('should check if deadline is expired', () => {
      expect(component.isDeadLineExpired('2020-01-01')).toBeTrue();
      expect(component.isDeadLineExpired('2099-12-31')).toBeFalse();
      expect(component.isDeadLineExpired(null)).toBeFalse();
    });

    it('should emit reUseJob on reUseJobPost', () => {
      spyOn(component.reUseJob, 'emit');
      const job = { id: 1 };
      component.reUseJobPost(job);
      expect(component.reUseJob.emit).toHaveBeenCalledWith(job);
    });

    it('should emit editJob on onEdit', () => {
      spyOn(component.editJob, 'emit');
      const job = { id: 2 };
      component.onEdit(job);
      expect(component.editJob.emit).toHaveBeenCalledWith(job);
    });

    it('should update page on onPageChange', () => {
      component.onPageChange(3);
      expect(component.ContentP).toBe(3);
    });

    it('should navigate to jobs-applied with query param on onViewApplication', () => {
      component.onViewApplication(101);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/jobs-applied'], {
        queryParams: { jobId: 101 },
      });
    });
  });

  describe('Active/Inactive Job Confirmation', () => {
    it('should call activeInActiveByID upon confirmation', async () => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true } as any)
      );
      mockJobPostingService.activeInActiveByID.and.returnValue(
        of({ message: 'Success', result: 'Status updated', activity: 'Active' })
      );

      component.activeInActiveByID(1, true);
      await fixture.whenStable();

      expect(mockJobPostingService.activeInActiveByID).toHaveBeenCalledWith(1, true);
      expect(mockToastr.success).toHaveBeenCalledWith('Status updated');
    });
  });
});
