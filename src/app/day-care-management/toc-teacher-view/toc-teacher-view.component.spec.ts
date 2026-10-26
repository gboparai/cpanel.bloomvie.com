import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TocTeacherViewComponent } from './toc-teacher-view.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { TocTeacherViewService } from './toc-teacher-view.service';
import { CookieService } from 'ngx-cookie-service';
import { TocRegistrationService } from '../../toc-registration/toc-registration.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

describe('TocTeacherViewComponent', () => {
  let component: TocTeacherViewComponent;
  let fixture: ComponentFixture<TocTeacherViewComponent>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockTocTeacherViewService: jasmine.SpyObj<TocTeacherViewService>;
  let mockCookie: jasmine.SpyObj<CookieService>;
  let mockTocRegService: jasmine.SpyObj<TocRegistrationService>;

  beforeEach(async () => {
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'warning', 'error', 'info']);
    mockTocTeacherViewService = jasmine.createSpyObj('TocTeacherViewService', [
      'getALlTocApprovedTeacher',
      'getAllDays',
      'getAllClassesByTimings',
    ]);
    mockCookie = jasmine.createSpyObj('CookieService', ['get']);
    mockTocRegService = jasmine.createSpyObj('TocRegistrationService', [
      'getQualifications',
      'getAllAreaOfExpertise',
      'getDocumentTypeList',
      'getTOCUserDetailByID',
    ]);

    mockCookie.get.and.returnValue('10');
    mockTocTeacherViewService.getALlTocApprovedTeacher.and.returnValue(of({
      message: 'Success',
      result: [{ userID: 1, teacherName: 'Sarah', workingDayName: 'Monday', slotStartTime: '09:00', slotEndTime: '17:00' }],
    }));
    mockTocTeacherViewService.getAllDays.and.returnValue(of({
      message: 'Success',
      result: [{ id: 1, day: 'Monday' }, { id: 2, day: 'Tuesday' }],
    }));
    mockTocRegService.getQualifications.and.returnValue(of({
      message: 'OK',
      result: [{ id: 1, name: 'Bachelor of Education' }],
    }));
    mockTocRegService.getAllAreaOfExpertise.and.returnValue(of({
      message: 'Success',
      result: [{ id: 1, name: 'Early Childhood' }],
    }));
    mockTocRegService.getDocumentTypeList.and.returnValue(of({
      message: 'OK',
      result: [{ id: 1, documentType: 'Certificate' }],
    }));

    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal'),
    });

    await TestBed.configureTestingModule({
      imports: [TocTeacherViewComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: ToastrService, useValue: mockToastr },
        { provide: TocTeacherViewService, useValue: mockTocTeacherViewService },
        { provide: CookieService, useValue: mockCookie },
        { provide: TocRegistrationService, useValue: mockTocRegService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(TocTeacherViewComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(TocTeacherViewComponent);
    component = fixture.componentInstance;
  });

  it('should create TocTeacherViewComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit and Initial Data', () => {
    it('should initialize CentreID and load all approved teachers, qualifications, expertise, document types, and days', fakeAsync(() => {
      component.ngOnInit();
      tick(150);

      expect(mockTocTeacherViewService.getALlTocApprovedTeacher).toHaveBeenCalledWith(10);
      expect(mockTocRegService.getQualifications).toHaveBeenCalled();
      expect(mockTocRegService.getAllAreaOfExpertise).toHaveBeenCalled();
      expect(mockTocRegService.getDocumentTypeList).toHaveBeenCalled();
      expect(mockTocTeacherViewService.getAllDays).toHaveBeenCalled();
      expect(component.tocTeacher.length).toBe(1);
    }));
  });

  describe('Qualification and Expertise formatting', () => {
    it('should get qualification name by ID string', () => {
      component.qualification = [
        { id: 1, name: 'ECE' },
        { id: 2, name: 'B.Ed' },
      ];

      expect(component.getQualificationName('1')).toBe('ECE');
      expect(component.getQualificationName('1,2')).toContain('B.Ed');
    });

    it('should get expertise name by ID string', () => {
      component.expertise = [
        { id: 1, name: 'Infant' },
        { id: 2, name: 'Preschool' },
      ];

      expect(component.getExpertiseName('1')).toBe('Infant');
      expect(component.getExpertiseName('1,2')).toContain('Preschool');
    });

    it('should get Day ID by Day Name', () => {
      component.masterDays = [{ id: 1, day: 'Monday' }, { id: 2, day: 'Tuesday' }];
      expect(component.getDayID('Monday')).toBe(1);
      expect(component.getDayID('Wednesday')).toBe(0);
    });
  });

  describe('Modal Displays', () => {
    it('should get TOC user details by ID and display view modal', fakeAsync(() => {
      component.qualification = [{ id: 1, name: 'ECE' }];
      component.expertise = [{ id: 1, name: 'Infant' }];
      component.documentType = [{ id: 1, documentType: 'Resume' }];

      mockTocRegService.getTOCUserDetailByID.and.returnValue(of({
        message: 'ok',
        result: {
          userID: 1,
          qualification: '1',
          expertise: '1',
          uploadedDocumentType: 1,
        },
      }));

      const mockToc = { userID: 1, workingDayName: 'Monday' };
      component.getTocUserDetailsByID(mockToc);
      tick(150);

      expect(mockTocRegService.getTOCUserDetailByID).toHaveBeenCalledWith(1 as any, '10' as any);
      expect(component.TocDetail.qualificationName).toBe('ECE');
      expect(component.TocDetail.expertiseName).toBe('Infant');
      expect(component.TocDetail.documentTypeNames).toBe('Resume');
    }));

    it('should display class assignment modal on valid day', fakeAsync(() => {
      component.masterDays = [{ id: 1, day: 'Monday' }];
      mockTocTeacherViewService.getAllClassesByTimings.and.returnValue(of({
        message: 'Success',
        result: [{ classID: 5, className: 'Preschool' }],
      }));

      const teacherRecord = {
        workingDayName: 'Monday',
        slotStartTime: '09:00',
        slotEndTime: '17:00',
        teacherName: 'Sarah',
        userID: 1,
      };

      component.displayClassAssignment(teacherRecord);
      tick(150);

      expect(mockTocTeacherViewService.getAllClassesByTimings).toHaveBeenCalled();
      expect(component.classList.length).toBe(1);
      expect(component.tocClassTeacherAssignmentForm.value.teacherName).toBe('Sarah');
    }));

    it('should show warning if day does not exist', async () => {
      component.masterDays = [];
      const teacherRecord = { workingDayName: 'Unknown' };

      await component.displayClassAssignment(teacherRecord);

      expect(mockToastr.warning).toHaveBeenCalledWith('day Does not Exists!!');
    });
  });
});
