import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TocViewComponent } from './toc-view.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TocViewService } from './toc-view.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { TocRegistrationService } from '../toc-registration/toc-registration.service';
import { DatePipe } from '@angular/common';
import { CommonService } from '../common-component/common.service';
import { DomSanitizer } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

describe('TocViewComponent', () => {
  let component: TocViewComponent;
  let fixture: ComponentFixture<TocViewComponent>;
  let mockTocViewService: any;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockHttp: jasmine.SpyObj<HttpClient>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockTocRegService: any;
  let mockDatePipe: any;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockSanitizer: jasmine.SpyObj<DomSanitizer>;
  let modalSpy: jasmine.Spy;

  beforeEach(async () => {
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockHttp = jasmine.createSpyObj('HttpClient', ['get', 'post']);
    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'set']);
    mockDatePipe = jasmine.createSpyObj('DatePipe', ['transform']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['convertS3File']);
    mockSanitizer = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustResourceUrl']);

    mockTocViewService = jasmine.createSpyObj('TocViewService', [
      'getAppliedJobTOCList',
      'getAppliedJobTOByID',
      'getQualifications',
      'getDocumentTypeList',
      'tocApprovedReject',
      'SendTOCRequestToUser',
      'SendSlotRequestToUserAtOnce',
      'GetAllDays',
      'getTocUserFilter'
    ]);

    mockTocRegService = jasmine.createSpyObj('TocRegistrationService', [
      'getAllAreaOfExpertise',
      'getAllMasterStatus'
    ]);

    modalSpy = jasmine.createSpy('modal');
    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: modalSpy,
      val: jasmine.createSpy('val').and.returnValue('09:00'),
      tab: jasmine.createSpy('tab'),
    });

    mockDatePipe.transform.and.callFake((val: any) => '2025-01-01');
    mockSanitizer.bypassSecurityTrustResourceUrl.and.callFake((val: string) => `safe:${val}` as any);

    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'UserId') return '101';
      if (key === 'CentreID') return '5';
      if (key === 'UserRoleId') return '4';
      if (key === 'UserInfo') return JSON.stringify({ result: { pinCode: 'V5K 0A1' } });
      return '';
    });

    mockTocViewService.GetAllDays.and.returnValue(of({
      message: 'Success',
      result: [{ id: 1, name: 'Monday' }]
    }));
    mockTocRegService.getAllMasterStatus.and.returnValue(of({
      message: 'OK',
      result: [{ id: 1, status: 'Pending' }]
    }));
    mockTocViewService.getQualifications.and.returnValue(of({
      message: 'OK',
      result: [{ id: 1, name: 'ECE Level 1' }]
    }));
    mockTocViewService.getDocumentTypeList.and.returnValue(of({
      message: 'OK',
      result: [{ id: 1, documentType: "Driver's License" }]
    }));
    mockTocRegService.getAllAreaOfExpertise.and.returnValue(of({
      message: 'Success',
      result: [{ id: 1, name: 'Infant', isActive: true }]
    }));
    mockTocViewService.getAppliedJobTOCList.and.returnValue(of({
      message: 'ok',
      result: [{ id: 10, teacherName: 'Alice', status: 'Accepted' }]
    }));

    await TestBed.configureTestingModule({
      imports: [TocViewComponent],
      providers: [
        { provide: TocViewService, useValue: mockTocViewService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: HttpClient, useValue: mockHttp },
        { provide: CookieService, useValue: mockCookieService },
        { provide: TocRegistrationService, useValue: mockTocRegService },
        { provide: DatePipe, useValue: mockDatePipe },
        { provide: CommonService, useValue: mockCommonService },
        { provide: DomSanitizer, useValue: mockSanitizer }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(TocViewComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(TocViewComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit and Initial State', () => {
    it('should initialize properties and call list methods', fakeAsync(() => {
      spyOn(window, 'scrollTo');
      spyOn(component, 'GetAllDays').and.callThrough();
      spyOn(component, 'getQualifications').and.callThrough();
      spyOn(component, 'getAppliedJobTOCList').and.callThrough();

      component.ngOnInit();
      tick();

      expect(component.UserID).toBe(101);
      expect(component.CentreID).toBe(5);
      expect(component.userRoleID).toBe(4);
      expect(component.GetAllDays).toHaveBeenCalled();
      expect(component.getQualifications).toHaveBeenCalled();
      expect(component.getAppliedJobTOCList).toHaveBeenCalledWith('Accepted');
      expect(window.scrollTo).toHaveBeenCalled();
    }));
  });

  describe('Search and Filter Methods', () => {
    it('should query filter data on Onsearchclick', () => {
      mockTocViewService.getTocUserFilter.and.returnValue(of({
        message: 'ok',
        result: [{ id: 10, name: 'Filtered TOC' }]
      }));

      component.StartDate = '2025-01-01';
      component.EndDate = '2025-01-10';
      component.selectedQualification = 1;
      component.selectedDay = 'Monday';

      component.Onsearchclick();

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(mockTocViewService.getTocUserFilter).toHaveBeenCalled();
      expect(component.AppliedJobTocList.length).toBe(1);
      expect(mockSpinner.hide).toHaveBeenCalled();
    });

    it('should reset filter parameters and fetch accepted list on resetfilter', () => {
      spyOn(component, 'getAppliedJobTOCList');
      const mockInput = document.createElement('input');
      spyOn(document, 'getElementById').and.returnValue(mockInput);

      component.resetfilter();

      expect(component.StartDate).toBe('');
      expect(component.EndDate).toBe('');
      expect(component.selectedQualification).toBeNull();
      expect(component.selectedDay).toBeNull();
      expect(component.getAppliedJobTOCList).toHaveBeenCalledWith('Accepted');
    });

    it('should toggle filter visibility on toggleFilter', () => {
      expect(component.isFilterVisible).toBeFalse();
      spyOn(component, 'dateRangePicker');

      component.toggleFilter();
      expect(component.isFilterVisible).toBeTrue();
      expect(component.dateRangePicker).toHaveBeenCalled();
    });

    it('should update page on onPageChange', () => {
      component.onPageChange(3);
      expect(component.ContentP).toBe(3);
    });

    it('should filter jobs on onSearchName', () => {
      spyOn(component, 'getAppliedJobTOCList');

      component.statusId = 3;
      component.Name = 'Ali';
      component.onSearchName();
      expect(component.getAppliedJobTOCList).toHaveBeenCalledWith('Pending');

      component.statusId = 6;
      component.Name = '';
      component.onSearchName();
      expect(component.getAppliedJobTOCList).toHaveBeenCalledWith('Accepted');
    });
  });

  describe('Approval & Rejection Actions', () => {
    it('should open confirmation dialog and approve candidate on tocApproveReject', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      spyOn(component, 'ApprovedReject');

      component.tocApproveReject(10, 'Pending', 20);
      tick(600);

      expect(component.ApprovedReject).toHaveBeenCalledWith(10, 'Pending', 20, 101);
    }));

    it('should call tocApprovedReject service and refresh list on ApprovedReject', () => {
      mockTocViewService.tocApprovedReject.and.returnValue(of({ message: 'ok' }));
      spyOn(Swal, 'fire');
      spyOn(component, 'getAppliedJobTOCList');

      component.ApprovedReject(10, 'Pending', 20, 101);

      expect(mockTocViewService.tocApprovedReject).toHaveBeenCalledWith({
        teacherId: 10,
        statusId: 1,
        masterUserID: 20,
        AcceptRejectBy: 101
      });
      expect(Swal.fire).toHaveBeenCalled();
      expect(component.getAppliedJobTOCList).toHaveBeenCalledWith('Pending');
    });
  });

  describe('Preview & Mime Types', () => {
    it('should return correct mime type in getMimeTypeFromExtension', () => {
      expect(component.getMimeTypeFromExtension('.pdf')).toBe('application/pdf');
      expect(component.getMimeTypeFromExtension('.jpg')).toBe('image/jpeg');
      expect(component.getMimeTypeFromExtension('.png')).toBe('image/png');
      expect(component.getMimeTypeFromExtension('.doc')).toBe('application/msword');
      expect(component.getMimeTypeFromExtension('.docx')).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      expect(component.getMimeTypeFromExtension('.xyz')).toBe('application/octet-stream');
    });

    it('should set preview properties in openPreview', () => {
      component.openPreview('http://domain.com/doc.pdf', 'application/pdf');
      expect(component.previewMime).toBe('application/pdf');
      expect(component.previewUrl).toBe('safe:http://domain.com/doc.pdf' as any);
      expect(component.isModalVisible).toBeTrue();
    });

    it('should check centre ID in request string properly', () => {
      component.CentreID = 5;
      expect(component.isCentreIdInRequest('1,5,10')).toBeTrue();
      expect(component.isCentreIdInRequest('1,2,3')).toBeFalse();
      expect(component.isCentreIdInRequest(null)).toBeFalse();
    });

    it('should check centre ID rejection string properly', () => {
      component.CentreID = 5;
      expect(component.isCentreIdRejected('5,7')).toBeTrue();
      expect(component.isCentreIdRejected('1,2')).toBeFalse();
      expect(component.isCentreIdRejected(undefined)).toBeFalse();
    });
  });
});
