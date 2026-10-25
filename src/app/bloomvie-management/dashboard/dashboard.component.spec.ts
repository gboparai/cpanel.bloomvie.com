import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { JobPortalServiceService } from '../../day-care-management/job-portal-details/job-portal-service.service';
import { CookieService } from 'ngx-cookie-service';
import { DashboardService } from './dashboard.service';
import { TocViewService } from '../../toc-view/toc-view.service';
import { DcAppointmentsListService } from '../dc-appointments-list/dc-appointments-list.service';
import { TocRegistrationService } from '../../toc-registration/toc-registration.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '../../common-component/common.service';
import Swal from 'sweetalert2';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  let jobPortalDetailServiceSpy: jasmine.SpyObj<JobPortalServiceService>;
  let cookieServiceSpy: jasmine.SpyObj<CookieService>;
  let dashboardServiceSpy: jasmine.SpyObj<DashboardService>;
  let tocViewServiceSpy: jasmine.SpyObj<TocViewService>;
  let dcAppointmentsListServiceSpy: jasmine.SpyObj<DcAppointmentsListService>;
  let tocRegistrationServiceSpy: jasmine.SpyObj<TocRegistrationService>;
  let spinnerSpy: jasmine.SpyObj<NgxSpinnerService>;
  let commonServiceSpy: jasmine.SpyObj<CommonService>;
  let sanitizerSpy: jasmine.SpyObj<DomSanitizer>;
  let routerSpy: jasmine.SpyObj<Router>;
  let modalSpy: jasmine.Spy;
  let tabSpy: jasmine.Spy;

  beforeEach(async () => {
    jobPortalDetailServiceSpy = jasmine.createSpyObj('JobPortalServiceService', ['getJobByID']);
    cookieServiceSpy = jasmine.createSpyObj('CookieService', ['get']);
    dashboardServiceSpy = jasmine.createSpyObj('DashboardService', [
      'getDashBoardCount',
      'getAppliedJobTOCListByStatus',
      'getInterestedDayCare',
      'getAllJobs',
    ]);
    tocViewServiceSpy = jasmine.createSpyObj('TocViewService', [
      'getQualifications',
      'getDocumentTypeList',
      'getAppliedJobTOByID',
      'tocApprovedReject',
    ]);
    dcAppointmentsListServiceSpy = jasmine.createSpyObj('DcAppointmentsListService', ['getDayCareAppointments']);
    tocRegistrationServiceSpy = jasmine.createSpyObj('TocRegistrationService', ['getAllAreaOfExpertise']);
    spinnerSpy = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    commonServiceSpy = jasmine.createSpyObj('CommonService', ['convertS3File']);
    sanitizerSpy = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustResourceUrl']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    // Mock regionResponseSignal
    (commonServiceSpy as any).regionResponseSignal = signal({
      offsetHours: '0',
      offsetMinutes: '0',
      offsetString: '+00:00',
    });

    // Mock cookies
    cookieServiceSpy.get.and.callFake((key: string) => {
      if (key === 'CentreID') return '10';
      if (key === 'UserRoleId') return '1';
      if (key === 'UserId') return '99';
      return '0';
    });

    // Mock window.$ jQuery
    modalSpy = jasmine.createSpy('modal');
    tabSpy = jasmine.createSpy('tab');
    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: modalSpy,
      tab: tabSpy,
    });

    // Mock URL.createObjectURL
    if (!window.URL.createObjectURL) {
      window.URL.createObjectURL = jasmine.createSpy('createObjectURL').and.returnValue('blob:url');
    } else {
      spyOn(window.URL, 'createObjectURL').and.returnValue('blob:url');
    }

    // Default API returns
    dashboardServiceSpy.getDashBoardCount.and.returnValue(
      of({ message: 'OK', result: { totalDayCare: 5 } })
    );
    tocViewServiceSpy.getQualifications.and.returnValue(
      of({ message: 'OK', result: [{ id: 1, name: 'B.Ed' }, { id: 2, name: 'ECE' }] })
    );
    tocViewServiceSpy.getDocumentTypeList.and.returnValue(
      of({ message: 'OK', result: [{ id: 1, documentType: 'Resume' }] })
    );
    tocRegistrationServiceSpy.getAllAreaOfExpertise.and.returnValue(
      of({
        message: 'Success',
        result: [
          { id: 1, name: 'Special Needs', isActive: true },
          { id: 2, name: 'Infant Care', isActive: false },
        ],
      })
    );
    dashboardServiceSpy.getAppliedJobTOCListByStatus.and.returnValue(
      of({ message: 'ok', result: [{ id: 1, name: 'John Doe' }] })
    );
    dcAppointmentsListServiceSpy.getDayCareAppointments.and.returnValue(
      of({ result: [{ id: 1 }, { id: 2 }] })
    );
    dashboardServiceSpy.getInterestedDayCare.and.returnValue(
      of({ message: 'OK', result: [{ id: 1, name: 'Sunny Daycare' }] })
    );

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: JobPortalServiceService, useValue: jobPortalDetailServiceSpy },
        { provide: CookieService, useValue: cookieServiceSpy },
        { provide: DashboardService, useValue: dashboardServiceSpy },
        { provide: TocViewService, useValue: tocViewServiceSpy },
        { provide: DcAppointmentsListService, useValue: dcAppointmentsListServiceSpy },
        { provide: TocRegistrationService, useValue: tocRegistrationServiceSpy },
        { provide: NgxSpinnerService, useValue: spinnerSpy },
        { provide: CommonService, useValue: commonServiceSpy },
        { provide: DomSanitizer, useValue: sanitizerSpy },
        { provide: Router, useValue: routerSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create the component and initialize approveForm', () => {
    expect(component).toBeTruthy();
    expect(component.approveForm).toBeDefined();
    expect(component.approveForm.value).toEqual({ id: 0, statusID: '' });
  });

  describe('ngOnInit', () => {
    it('should initialize calendarOptions and parse cookies', () => {
      component.ngOnInit();

      expect(component.calendarOptions).toBeDefined();
      expect(component.calendarOptions.initialView).toBe('dayGridMonth');
      expect(component.dayCare).toBe(10);
      expect(component.CookiesUserRoleId).toBe(1);
      expect(component.CookiesUserId).toBe(99);
      expect(dashboardServiceSpy.getDashBoardCount).toHaveBeenCalledWith(1, 99);
      expect(tocViewServiceSpy.getQualifications).toHaveBeenCalled();
      expect(tocViewServiceSpy.getDocumentTypeList).toHaveBeenCalled();
      expect(tocRegistrationServiceSpy.getAllAreaOfExpertise).toHaveBeenCalled();
      expect(dashboardServiceSpy.getAppliedJobTOCListByStatus).toHaveBeenCalled();
      expect(dcAppointmentsListServiceSpy.getDayCareAppointments).toHaveBeenCalled();
      expect(dashboardServiceSpy.getInterestedDayCare).toHaveBeenCalledWith(1, '');
      expect(component.userOffset).toMatch(/^[+-]\d{2}:\d{2}$/);
    });

    it('should not call getDashBoardCount if CookiesUserRoleId <= 0', () => {
      cookieServiceSpy.get.and.callFake((key: string) => {
        if (key === 'CentreID') return '10';
        if (key === 'UserRoleId') return '0';
        if (key === 'UserId') return '99';
        return '0';
      });

      component.ngOnInit();

      expect(component.CookiesUserRoleId).toBe(0);
      expect(dashboardServiceSpy.getDashBoardCount).not.toHaveBeenCalled();
    });
  });

  describe('getAppliedJobTOCListByStatus', () => {
    it('should set Tocjobs and clear skeleton when response is ok', () => {
      component.Name = 'Candidate';
      dashboardServiceSpy.getAppliedJobTOCListByStatus.and.returnValue(
        of({ message: 'ok', result: [{ id: 10 }] })
      );

      component.getAppliedJobTOCListByStatus();

      expect(dashboardServiceSpy.getAppliedJobTOCListByStatus).toHaveBeenCalledWith('Candidate', 3);
      expect(component.Tocjobs).toEqual([{ id: 10 }]);
      expect(component.skalatonShowToc).toBe('');
      expect(component.skeletonShow).toBe('');
    });

    it('should empty Tocjobs when response is not ok', () => {
      dashboardServiceSpy.getAppliedJobTOCListByStatus.and.returnValue(
        of({ message: 'error', result: null })
      );

      component.getAppliedJobTOCListByStatus();

      expect(component.Tocjobs).toEqual([]);
      expect(component.skalatonShowToc).toBe('');
    });
  });

  describe('onSearchName', () => {
    it('should call getInterestedDayCare when search term length > 3', () => {
      const event = { target: { value: 'Sunflower' } };
      component.onSearchName(event);

      expect(dashboardServiceSpy.getInterestedDayCare).toHaveBeenCalledWith(1, 'Sunflower');
    });

    it('should call getInterestedDayCare with empty string when search term is empty', () => {
      const event = { target: { value: '' } };
      component.onSearchName(event);

      expect(dashboardServiceSpy.getInterestedDayCare).toHaveBeenCalledWith(1, '');
    });

    it('should not call getInterestedDayCare when search term length is between 1 and 3', () => {
      dashboardServiceSpy.getInterestedDayCare.calls.reset();
      const event = { target: { value: 'abc' } };
      component.onSearchName(event);

      expect(dashboardServiceSpy.getInterestedDayCare).not.toHaveBeenCalled();
    });
  });

  describe('onTocSearchName', () => {
    it('should reset Name and refresh list when Name is shorter than 3 characters', () => {
      component.Name = 'ab';
      spyOn(component, 'getAppliedJobTOCListByStatus');

      component.onTocSearchName();

      expect(component.Name).toBe('');
      expect(component.getAppliedJobTOCListByStatus).toHaveBeenCalled();
    });

    it('should search with current Name when length is 3 or more', () => {
      component.Name = 'TOC Candidate';
      spyOn(component, 'getAppliedJobTOCListByStatus');

      component.onTocSearchName();

      expect(component.Name).toBe('TOC Candidate');
      expect(component.getAppliedJobTOCListByStatus).toHaveBeenCalled();
    });
  });

  describe('Job and appointment helper methods', () => {
    it('should set jobs data in openJobDetails', () => {
      component.openJobDetails([{ id: 1 }, { id: 2 }]);
      expect(component.jobs).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it('should format date string correctly', () => {
      expect(component.formatDate('')).toBeNull();
      expect(component.formatDate('2026-10-25T14:30:00')).toBe('2026-10-25');
    });

    it('should load job details from service', () => {
      jobPortalDetailServiceSpy.getJobByID.and.returnValue(
        of({ result: [{ id: 5, title: 'Teacher' }] })
      );

      component.loadJobDetails(5);

      expect(jobPortalDetailServiceSpy.getJobByID).toHaveBeenCalledWith(5);
      expect(component.job).toEqual({ id: 5, title: 'Teacher' });
    });

    it('should handle error when loading job details', () => {
      spyOn(console, 'error');
      jobPortalDetailServiceSpy.getJobByID.and.returnValue(throwError(() => new Error('API error')));

      component.loadJobDetails(99);

      expect(console.error).toHaveBeenCalled();
    });

    it('should update pagination pages', () => {
      component.onPageChange(3);
      expect(component.ContentP).toBe(3);

      component.onPageChangeToc(4);
      expect(component.TocContentP).toBe(4);
    });

    it('should scroll to pending approval element if container exists', () => {
      const scrollSpy = jasmine.createSpy('scrollIntoView');
      component.jobListContainer = new ElementRef({ scrollIntoView: scrollSpy });

      component.scrollToPendingApproval();

      expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    });

    it('should scroll to jobs element using getElementById', () => {
      const element = document.createElement('div');
      element.id = 'jobListContainer';
      spyOn(element, 'scrollIntoView');
      spyOn(document, 'getElementById').and.returnValue(element);

      component.scrollToJobs();

      expect(element.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    });
  });

  describe('Mime types and Base64 conversion', () => {
    it('should return appropriate mime type for extensions', () => {
      expect(component.getMimeTypeFromExtension('.pdf')).toBe('application/pdf');
      expect(component.getMimeTypeFromExtension('.jpg')).toBe('image/jpeg');
      expect(component.getMimeTypeFromExtension('.jpeg')).toBe('image/jpeg');
      expect(component.getMimeTypeFromExtension('.png')).toBe('image/png');
      expect(component.getMimeTypeFromExtension('.doc')).toBe('application/msword');
      expect(component.getMimeTypeFromExtension('.docx')).toBe(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
      expect(component.getMimeTypeFromExtension('.unknown')).toBe('application/octet-stream');
    });

    it('should convert base64 to Blob and generate URL', () => {
      // base64 for 'Hello World'
      const base64 = btoa('Hello World');
      const result = component.ConvertS3File(base64, 'text/plain');

      expect(result.blob).toBeInstanceOf(Blob);
      expect(result.url).toBe('blob:url');
    });
  });

  describe('getByIDForView', () => {
    it('should fetch candidate details, process data mappings, and show modal', () => {
      component.dayCare = 10;
      component.QualificationList = [
        { id: 1, name: 'B.Ed' },
        { id: 2, name: 'ECE' },
      ];
      component.documentTypeList = [{ id: 1, documentType: 'Resume' }];
      component.expertise = [{ id: 1, name: 'Preschool' }];

      const mockCandidate = {
        educational_Credentails: btoa('test doc'),
        educational_Credentails_ex: '.pdf',
        documentResumes: btoa('test resume'),
        documentResumes_ex: '.docx',
        uploadedDocument: '',
        qualification: '1,2',
        workingDays: '1,5',
        uploadedDocumentType: 1,
        slots: [
          { workingDayName: 'Monday', startTime: '09:00', endTime: '12:00' },
          { workingDayName: 'Monday', startTime: '13:00', endTime: '17:00' },
        ],
        expertise: '1',
      };

      tocViewServiceSpy.getAppliedJobTOByID.and.returnValue(
        of({ message: 'ok', result: [mockCandidate] })
      );

      component.getByIDForView(123);

      expect(spinnerSpy.show).toHaveBeenCalled();
      expect(spinnerSpy.hide).toHaveBeenCalled();
      expect(modalSpy).toHaveBeenCalledWith('show');
      expect(component.TocDetail.qualificationNames).toBe('B.Ed, ECE');
      expect(component.TocDetail.workingDaysNames).toBe('Monday, Friday');
      expect(component.TocDetail.documentTypeNames).toBe('Resume');
      expect(component.TocDetail.expertiseNames).toBe('Preschool');
      expect(component.TocDetail.groupedSlots.length).toBe(1);
      expect(component.TocDetail.groupedSlots[0].day).toBe('Monday');
    });

    it('should handle numeric qualification and array expertise', () => {
      component.dayCare = 10;
      component.QualificationList = [{ id: 5, name: 'PhD' }];
      component.expertise = [{ id: 3, name: 'Kindergarten' }];

      const mockCandidate = {
        qualification: 5,
        workingDays: '',
        uploadedDocumentType: 0,
        expertise: [3],
        slots: null,
      };

      tocViewServiceSpy.getAppliedJobTOByID.and.returnValue(
        of({ message: 'ok', result: [mockCandidate] })
      );

      component.getByIDForView(456);

      expect(component.TocDetail.qualificationNames).toBe('PhD');
      expect(component.TocDetail.workingDaysNames).toBe('No working days listed');
      expect(component.TocDetail.documentTypeNames).toBe('No document types listed');
      expect(component.TocDetail.expertiseNames).toBe('Kindergarten');
    });

    it('should reset TocDetail and hide spinner on error', () => {
      spyOn(console, 'error');
      tocViewServiceSpy.getAppliedJobTOByID.and.returnValue(throwError(() => new Error('Failed')));

      component.getByIDForView(999);

      expect(component.TocDetail).toEqual([]);
      expect(spinnerSpy.hide).toHaveBeenCalled();
    });
  });

  describe('TOC Candidate Approval / Rejection', () => {
    it('should trigger Swal confirmation in tocApproveReject', () => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: false, isDenied: false, isDismissed: true } as any));

      component.tocApproveReject(101, 'Pending', 202);

      expect(Swal.fire).toHaveBeenCalled();
    });

    it('should approve candidate when reason is empty', fakeAsync(() => {
      tocViewServiceSpy.tocApprovedReject.and.returnValue(of({ message: 'ok' }));
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      spyOn(component, 'getAppliedJobTOCListByStatus');

      component.TOCApprovedReject(101, 'Pending', 202, 99, '');
      tick();

      expect(tocViewServiceSpy.tocApprovedReject).toHaveBeenCalledWith({
        teacherId: 101,
        statusId: 6,
        masterUserID: 202,
        AcceptRejectBy: 99,
      });
      expect(Swal.fire).toHaveBeenCalled();
    }));

    it('should reject candidate when reason is provided', fakeAsync(() => {
      tocViewServiceSpy.tocApprovedReject.and.returnValue(of({ message: 'ok' }));
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));

      component.TOCApprovedReject(101, 'Pending', 202, 99, 'Not qualified');
      tick();

      expect(tocViewServiceSpy.tocApprovedReject).toHaveBeenCalledWith({
        teacherId: 101,
        statusId: 2,
        masterUserID: 202,
        AcceptRejectBy: 99,
      });
      expect(Swal.fire).toHaveBeenCalled();
    }));
  });

  describe('Modal and Preview actions', () => {
    it('should open preview with sanitized url', () => {
      sanitizerSpy.bypassSecurityTrustResourceUrl.and.returnValue('safe:blob:url');

      component.openPreview('blob:url', 'application/pdf');

      expect(component.previewMime).toBe('application/pdf');
      expect(component.previewUrl).toBe('safe:blob:url');
      expect(component.isModalVisible).toBe(true);
    });

    it('should close preview and show view-del modal', () => {
      component.openPreview('blob:url', 'application/pdf');
      component.closePreview();

      expect(component.isModalVisible).toBe(false);
      expect(component.previewUrl).toBeNull();
      expect(modalSpy).toHaveBeenCalledWith('show');
    });

    it('should hide modal on onclick', () => {
      component.onclick();
      expect(modalSpy).toHaveBeenCalledWith('hide');
    });

    it('should navigate to /chatbox on navigate', () => {
      component.navigate();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/chatbox']);
    });

    it('should download file by creating link element and clicking it', () => {
      const clickSpy = jasmine.createSpy('click');
      spyOn(document, 'createElement').and.callFake((tag: string) => {
        if (tag === 'a') {
          return {
            href: '',
            download: '',
            click: clickSpy,
          } as any;
        }
        return document.createElement(tag);
      });

      component.downloadFile('https://example.com/file.pdf');

      expect(clickSpy).toHaveBeenCalled();
    });
  });
});
