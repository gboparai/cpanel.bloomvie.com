import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ApplyLeaveComponent } from './apply-leave.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../common.service';
import { ManageMasterLeaveService } from '../../bloomvie-management/manage-master-leave/manage-master-leave.service';
import { CookieService } from 'ngx-cookie-service';
import { ApplyleaveService } from './applyleave.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ClassroomDetailsService } from '../../day-care-management/classroom-management/classroom-details/classroom-details.service';
import { TocRegistrationService } from '../../toc-registration/toc-registration.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

describe('ApplyLeaveComponent', () => {
  let component: ApplyLeaveComponent;
  let fixture: ComponentFixture<ApplyLeaveComponent>;

  let mockDatePipe: jasmine.SpyObj<DatePipe>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockLeaveTypeService: any;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockApplyService: jasmine.SpyObj<ApplyleaveService>;
  let mockSanitizer: jasmine.SpyObj<DomSanitizer>;
  let mockClassroomService: any;
  let mockTocRegistrationService: jasmine.SpyObj<TocRegistrationService>;

  beforeEach(async () => {
    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal'),
      val: jasmine.createSpy('val'),
      text: jasmine.createSpy('text')
    });

    mockDatePipe = jasmine.createSpyObj('DatePipe', ['transform']);
    mockDatePipe.transform.and.returnValue('2026-05-15');

    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);
    
    mockCommonService = jasmine.createSpyObj('CommonService', [
      'validateInput',
      'uploadImages',
      'blobToFile',
      'base64ToBlobUrl'
    ]);
    mockCommonService.validateInput.and.callFake((val: string) => val);
    mockCommonService.blobToFile.and.returnValue(new File(['test'], 'test.png', { type: 'image/png' }));
    mockCommonService.base64ToBlobUrl.and.returnValue('blob:http://localhost/test');

    mockLeaveTypeService = jasmine.createSpyObj('ManageMasterLeaveService', ['getLeaveList']);
    mockLeaveTypeService.getLeaveList.and.returnValue(of({ message: 'OK', result: [{ id: 1, name: 'Sick' }] }));

    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'set', 'delete', 'check']);
    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'CentreID') return '10';
      if (key === 'UserId') return '123';
      if (key === 'UserRoleId') return '4';
      return '';
    });

    mockApplyService = jasmine.createSpyObj('ApplyleaveService', [
      'manageLeaves',
      'getTocSlotbyUserid',
      'getEmployeeLeave'
    ]);
    mockApplyService.manageLeaves.and.returnValue(of({ message: 'OK' }));
    mockApplyService.getTocSlotbyUserid.and.returnValue(of({ message: 'OK', result: [{ acceptedByUser: 10, workingDayID: 2 }] }));
    mockApplyService.getEmployeeLeave.and.returnValue(of({
      message: 'OK',
      result: [
        {
          startDate: '2026-05-01',
          endDate: '2026-05-03',
          firstName: 'John',
          email: 'john@test.com',
          leavesDocument: 'doc.pdf'
        }
      ]
    }));

    mockSanitizer = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustResourceUrl']);
    
    mockClassroomService = jasmine.createSpyObj('ClassroomDetailsService', [
      'getTeacherAvailability',
      'getCentreWorkingDaysByCentreID'
    ]);
    mockClassroomService.getTeacherAvailability.and.returnValue(of({ message: 'OK', result: [{ dayNumber: 1 }] }));
    mockClassroomService.getCentreWorkingDaysByCentreID.and.returnValue(of({ message: 'Success', result: { startTime: '09:00', endTime: '17:00' } }));

    mockTocRegistrationService = jasmine.createSpyObj('TocRegistrationService', ['getTOCUserDetailByID']);
    mockTocRegistrationService.getTOCUserDetailByID.and.returnValue(of({
      message: 'ok',
      result: {
        workingDays: '1,2,3',
        partTimeStartDate: '2026-05-01',
        partTimeEndDate: '2026-05-31'
      }
    }));

    await TestBed.configureTestingModule({
      imports: [ApplyLeaveComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: DatePipe, useValue: mockDatePipe },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: ToastrService, useValue: mockToastr },
        { provide: CommonService, useValue: mockCommonService },
        { provide: ManageMasterLeaveService, useValue: mockLeaveTypeService },
        { provide: CookieService, useValue: mockCookieService },
        { provide: ApplyleaveService, useValue: mockApplyService },
        { provide: DomSanitizer, useValue: mockSanitizer },
        { provide: ClassroomDetailsService, useValue: mockClassroomService },
        { provide: TocRegistrationService, useValue: mockTocRegistrationService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(ApplyLeaveComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplyLeaveComponent);
    component = fixture.componentInstance;
  });

  it('should create the ApplyLeaveComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize LeaveFrom with appropriate controls and validators', () => {
      expect(component.LeaveFrom).toBeDefined();
      expect(component.LeaveFrom.get('id')).toBeDefined();
      expect(component.LeaveFrom.get('startDate')).toBeDefined();
      expect(component.LeaveFrom.get('endDate')).toBeDefined();
      expect(component.LeaveFrom.get('typeOfLeave')).toBeDefined();
      expect(component.LeaveFrom.get('reason')).toBeDefined();
      expect(component.LeaveFrom.valid).toBeFalse();
    });
  });

  describe('ngOnInit', () => {
    it('should initialize properties from cookies and fetch initial data for role 4', fakeAsync(() => {
      spyOn(component, 'initializeFlatpickr2').and.callFake(() => {});
      component.ngOnInit();
      tick();

      expect(component.daycareCentreId).toBe(10);
      expect(component.teacherID).toBe(123);
      expect(component.userRoleId).toBe(4);
      expect(mockLeaveTypeService.getLeaveList).toHaveBeenCalled();
      expect(mockClassroomService.getCentreWorkingDaysByCentreID).toHaveBeenCalledWith(10);
      expect(mockClassroomService.getTeacherAvailability).toHaveBeenCalled();
    }));

    it('should fetch TOC user details if userRoleId is 8', fakeAsync(() => {
      mockCookieService.get.and.callFake((key: string) => {
        if (key === 'CentreID') return '10';
        if (key === 'UserId') return '123';
        if (key === 'UserRoleId') return '8';
        return '';
      });
      spyOn(component, 'initializeFlatpickrForTOCTeacher').and.callFake(() => {});
      spyOn(component, 'getTOCUserDetailByID').and.callThrough();
      spyOn(component, 'getTocSlotbyUserid').and.callThrough();

      component.ngOnInit();
      tick();

      expect(component.userRoleId).toBe(8);
      expect(component.getTOCUserDetailByID).toHaveBeenCalledWith(123);
      expect(component.getTocSlotbyUserid).toHaveBeenCalled();
    }));
  });

  describe('ngAfterViewInit', () => {
    it('should call initializeFlatpickr2 if role != 8', () => {
      component.userRoleId = 4;
      const spy = spyOn(component, 'initializeFlatpickr2').and.callFake(() => {});
      component.ngAfterViewInit();
      expect(spy).toHaveBeenCalled();
    });

    it('should not call initializeFlatpickr2 if role == 8', () => {
      component.userRoleId = 8;
      const spy = spyOn(component, 'initializeFlatpickr2').and.callFake(() => {});
      component.ngAfterViewInit();
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('onPageChange', () => {
    it('should update ContentP', () => {
      component.onPageChange(3);
      expect(component.ContentP).toBe(3);
    });
  });

  describe('onSelectActivityName', () => {
    it('should patch typeOfLeave on LeaveFrom', () => {
      component.onSelectActivityName({ id: 5 });
      expect(component.LeaveFrom.value.typeOfLeave).toBe(5);
    });
  });

  describe('onReasonInput', () => {
    it('should set reason field value and validate input', () => {
      const mockEvent = {
        target: {
          value: 'Medical emergency'
        }
      } as unknown as Event;

      component.onReasonInput(mockEvent, 'description');
      expect(component.LeaveFrom.value.reason).toBe('Medical emergency');
      expect(mockCommonService.validateInput).toHaveBeenCalledWith('Medical emergency', 'description');
    });
  });

  describe('manageLeaves', () => {
    it('should mark all controls as touched if form is invalid', async () => {
      component.LeaveFrom.patchValue({ startDate: '', endDate: '' });
      await component.manageLeaves();
      expect(component.LeaveFrom.touched).toBeTrue();
      expect(mockSpinner.show).not.toHaveBeenCalled();
    });

    it('should submit leaves successfully on valid form with OK response', async () => {
      component.userRoleId = 4;
      component.LeaveFrom.patchValue({
        startDate: '2026-05-10',
        endDate: '2026-05-12',
        typeOfLeave: 1,
        reason: 'Personal'
      });
      spyOn(component, 'UploadFiles').and.resolveTo({ result: [{ path: 'upload', imageName: 'file.jpg' }] });
      spyOn(component, 'clearForm').and.callFake(() => {});
      spyOn(component, 'getEmployeeLeave').and.resolveTo();

      await component.manageLeaves();

      expect(mockToastr.success).toHaveBeenCalledWith('Leave request submitted successfully.');
      expect(component.clearForm).toHaveBeenCalled();
      expect(mockSpinner.hide).toHaveBeenCalled();
    });

    it('should handle update response when message is Update', async () => {
      component.userRoleId = 4;
      component.LeaveFrom.patchValue({
        startDate: '2026-05-10',
        endDate: '2026-05-12',
        typeOfLeave: 1,
        reason: 'Personal'
      });
      mockApplyService.manageLeaves.and.returnValue(of({ message: 'Update' }));
      spyOn(component, 'UploadFiles').and.resolveTo({ result: [{ path: 'upload', imageName: 'file.jpg' }] });
      spyOn(component, 'clearForm').and.callFake(() => {});
      spyOn(component, 'getEmployeeLeave').and.resolveTo();

      await component.manageLeaves();

      expect(mockToastr.success).toHaveBeenCalledWith('Leave update successfully.');
    });

    it('should handle error when submit fails', async () => {
      component.userRoleId = 4;
      component.LeaveFrom.patchValue({
        startDate: '2026-05-10',
        endDate: '2026-05-12',
        typeOfLeave: 1,
        reason: 'Personal'
      });
      spyOn(component, 'UploadFiles').and.resolveTo({ result: [{ path: 'upload', imageName: 'file.jpg' }] });
      mockApplyService.manageLeaves.and.returnValue(throwError(() => new Error('API error')));

      await component.manageLeaves();

      expect(mockToastr.error).toHaveBeenCalledWith('Error submitting leave request');
      expect(mockSpinner.hide).toHaveBeenCalled();
    });
  });

  describe('clearForm', () => {
    it('should reset form values to defaults', () => {
      component.teacherID = 45;
      component.daycareCentreId = 12;
      component.clearForm();

      expect(component.LeaveFrom.value.id).toBe(0);
      expect(component.LeaveFrom.value.employeeId).toBe(45);
      expect(component.LeaveFrom.value.centreID).toBe(12);
      expect(component.fileList).toEqual([]);
    });
  });

  describe('File selection and cropping', () => {
    it('should set fileName and imageChangedEvent in FileSelectionBeforeCrop', () => {
      const mockEvent = {
        target: {
          files: [{ name: 'medical.pdf' }]
        }
      };
      component.FileSelectionBeforeCrop(mockEvent);
      expect(component.fileName).toBe('medical.pdf');
      expect(component.imageChangedEvent).toBe(mockEvent);
    });

    it('should store temp crop blob in storeTempCrop', () => {
      const mockBlob = new Blob(['sample']);
      component.storeTempCrop({ blob: mockBlob } as any);
      expect(component.tempCroppedEvent).toBe(mockBlob);
    });

    it('should process file in fileChangeHandler', () => {
      component.tempCroppedEvent = new Blob(['test']);
      component.fileName = 'cropped.jpg';
      component.fileChangeHandler('image/jpeg');

      expect(mockCommonService.blobToFile).toHaveBeenCalledWith(component.tempCroppedEvent, 'cropped.jpg');
      expect(component.fileList.length).toBe(1);
    });
  });

  describe('Date selections and filtering', () => {
    it('should set startDate in selectStartDate', () => {
      component.selectStartDate({ target: { value: '2026-05-10' } });
      expect(component.startDate).toBe('2026-05-10');
    });

    it('should set endDate in selectEndDate', () => {
      component.selectEndDate({ target: { value: '2026-05-20' } });
      expect(component.endDate).toBe('2026-05-20');
    });

    it('should format date using formatDate', () => {
      const d = new Date('2026-05-15');
      const res = component.formatDate(d);
      expect(res).toBe('2026-05-15');
      expect(mockDatePipe.transform).toHaveBeenCalledWith(d, 'MM/dd/yyyy');
    });

    it('should call getEmployeeLeave on Onsearchclick', () => {
      const spy = spyOn(component, 'getEmployeeLeave').and.resolveTo();
      component.Onsearchclick();
      expect(spy).toHaveBeenCalled();
    });

    it('should filter leaveList correctly with applyFilter', () => {
      component.leaveList = [
        { firstName: 'Alice', email: 'alice@example.com' },
        { firstName: 'Bob', email: 'bob@example.com' }
      ];
      component.searchText = 'alice';
      component.applyFilter();

      expect(component.filteredApplyLeave.length).toBe(1);
      expect(component.filteredApplyLeave[0].firstName).toBe('Alice');
      expect(component.displayedApplyLeave.length).toBe(1);
    });

    it('should return leaveList when searchText is empty in displayedApplyLeave', () => {
      component.leaveList = [{ firstName: 'Alice' }];
      component.searchText = '';
      expect(component.displayedApplyLeave).toBe(component.leaveList);
    });
  });

  describe('Preview & Type checks', () => {
    it('should set previewUrl and previewType on openPreview', () => {
      component.openPreview('http://test.com/img.png', 'image');
      expect(component.previewUrl).toBe('http://test.com/img.png');
      expect(component.previewType).toBe('image');
    });

    it('should clear preview on closePreview', () => {
      component.openPreview('http://test.com/img.png', 'image');
      component.closePreview();
      expect(component.previewUrl).toBeNull();
      expect(component.previewType).toBeNull();
    });

    it('should verify isImage and isPdf correctly', () => {
      expect(component.isImage('pic.png')).toBeTrue();
      expect(component.isImage('pic.jpg')).toBeTrue();
      expect(component.isImage('file.pdf')).toBeFalse();

      expect(component.isPdf('file.pdf')).toBeTrue();
      expect(component.isPdf('pic.png')).toBeFalse();
    });
  });

  describe('getDisabledDates and getNextAvailableDate', () => {
    it('should return list of cloned dates within leave range', () => {
      component.leaveList = [
        { startDate: '2026-05-01', endDate: '2026-05-02' }
      ];
      const disabled = component.getDisabledDates();
      expect(disabled.length).toBeGreaterThan(0);
    });

    it('should calculate next available date', () => {
      const next = component.getNextAvailableDate([]);
      expect(next).toBeDefined();
    });
  });

  describe('getAvailableLeaveDays', () => {
    it('should calculate number of available days based on working timing and days', () => {
      component.teacherAvailabilityDays = [{ dayNumber: 1 }, { dayNumber: 2 }];
      component.workTiming = {
        sundayIsWorking: false,
        mondayIsWorking: true,
        tuesdayIsWorking: true,
        wednesdayIsWorking: false,
        thursdayIsWorking: false,
        fridayIsWorking: false,
        saturdayIsWorking: false
      };
      const days = component.getAvailableLeaveDays(new Date('2026-05-04'), new Date('2026-05-05'));
      expect(days).toBeGreaterThanOrEqual(0);
    });
  });
});
