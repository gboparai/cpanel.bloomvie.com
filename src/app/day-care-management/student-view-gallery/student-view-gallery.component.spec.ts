import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { StudentViewGalleryComponent } from './student-view-gallery.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ManageStudentGalleryService } from '../manage-student-gallery/manage-student-gallery.service';
import { CookieService } from 'ngx-cookie-service';
import { CommonService } from '../../common-component/common.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ClassroomDetailsService } from '../classroom-management/classroom-details/classroom-details.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

describe('StudentViewGalleryComponent', () => {
  let component: StudentViewGalleryComponent;
  let fixture: ComponentFixture<StudentViewGalleryComponent>;
  let mockGalleryService: jasmine.SpyObj<ManageStudentGalleryService>;
  let mockCookie: jasmine.SpyObj<CookieService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockClassroomService: jasmine.SpyObj<ClassroomDetailsService>;

  beforeEach(async () => {
    mockGalleryService = jasmine.createSpyObj('ManageStudentGalleryService', [
      'getStudentGalleryByStudentID',
      'getStudentByParentID',
      'getTeacherDetailByParentID',
      'ManageComment',
      'GetComment',
    ]);
    mockCookie = jasmine.createSpyObj('CookieService', ['get', 'check']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['encrypt']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'warning', 'error', 'info']);
    mockClassroomService = jasmine.createSpyObj('ClassroomDetailsService', [
      'manageStudentRequest',
    ]);

    mockCookie.get.and.callFake((key: string) => {
      if (key === 'CentreID') return '10';
      if (key === 'UserId') return '5';
      if (key === 'UserRoleId') return '5';
      if (key === 'StudentID') return '12';
      if (key === 'AdminName') return 'Parent User';
      return '';
    });

    mockGalleryService.getStudentByParentID.and.returnValue(of({
      message: 'Success',
      result: [{ id: 12, name: 'Student 12' }],
    }));
    mockGalleryService.getTeacherDetailByParentID.and.returnValue(of({
      message: 'Success',
      result: { teacherName: 'Ms. Smith' },
    }));
    mockGalleryService.getStudentGalleryByStudentID.and.returnValue(of({
      message: 'Success',
      result: [{ id: 1, filePath: 'art.png', createdDate: '2026-04-01' }],
    }));

    await TestBed.configureTestingModule({
      imports: [StudentViewGalleryComponent, ReactiveFormsModule, FormsModule, CommonModule, NgSelectModule],
      providers: [
        FormBuilder,
        DatePipe,
        { provide: ManageStudentGalleryService, useValue: mockGalleryService },
        { provide: CookieService, useValue: mockCookie },
        { provide: CommonService, useValue: mockCommonService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: ToastrService, useValue: mockToastr },
        { provide: ClassroomDetailsService, useValue: mockClassroomService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(StudentViewGalleryComponent, { set: { imports: [ReactiveFormsModule, NgSelectModule, FormsModule, CommonModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(StudentViewGalleryComponent);
    component = fixture.componentInstance;
  });

  it('should create StudentViewGalleryComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit and Retrieval', () => {
    it('should read cookies and fetch students, gallery, and teacher details', () => {
      component.ngOnInit();

      expect(component.daycareID).toBe('10');
      expect(component.parentID).toBe(5);
      expect(component.studentID).toBe('12');
      expect(component.parentName).toBe('Parent User');
      expect(mockGalleryService.getStudentByParentID).toHaveBeenCalledWith(5);
      expect(mockGalleryService.getTeacherDetailByParentID).toHaveBeenCalledWith(5, '12');
    });
  });

  describe('Date Helpers and Navigation', () => {
    it('should format date correctly', () => {
      const date = new Date(2026, 4, 10); // May 10, 2026
      expect(component.formatDate(date)).toBe('2026-05-10');
    });

    it('should navigate to previous date', () => {
      component.formattedStartDate = '2026-05-10';
      spyOn(component, 'getStudentGallery');

      component.goToPreviousDate();

      expect(component.formattedStartDate).toBe('2026-05-09');
      expect(component.getStudentGallery).toHaveBeenCalled();
    });

    it('should check if next date is disabled for future dates', () => {
      component.selectedStartDate = component.formatDate(new Date());
      expect(component.isNextDateDisabled()).toBeTrue();
    });

    it('should navigate to next date if not disabled', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 3);
      component.formattedStartDate = component.formatDate(pastDate);
      spyOn(component, 'getStudentGallery');

      component.goToNextDate();

      expect(component.getStudentGallery).toHaveBeenCalled();
    });

    it('should prevent default on disableRightClick and disableDrag', () => {
      const mouseEvent = new MouseEvent('contextmenu');
      spyOn(mouseEvent, 'preventDefault');
      component.disableRightClick(mouseEvent);
      expect(mouseEvent.preventDefault).toHaveBeenCalled();

      const dragEvent = new DragEvent('dragstart');
      spyOn(dragEvent, 'preventDefault');
      component.disableDrag(dragEvent);
      expect(dragEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('File and Gallery Helpers', () => {
    it('should check if file is video in isVideo()', () => {
      expect(component.isVideo('sample.mp4')).toBeTrue();
      expect(component.isVideo('video.mov')).toBeTrue();
      expect(component.isVideo('photo.png')).toBeFalse();
    });

    it('should check if date is today or within last 7 days', () => {
      const today = new Date();
      expect(component.isTodayOrWithinLast7Days(today)).toBeTrue();

      const eightDaysAgo = new Date();
      eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);
      expect(component.isTodayOrWithinLast7Days(eightDaysAgo)).toBeFalse();
    });

    it('should clear form and date picker', () => {
      component.firstStartDate = '05-01-2026';
      component.firstEndDate = '05-10-2026';
      component.clearForm();

      expect(component.firstStartDate).toBe('');
      expect(component.firstEndDate).toBe('');
    });
  });

  describe('Comment operations', () => {
    it('should enable and cancel editing comments', () => {
      const commentObj = { isEditing: false, parentComment: 'Lovely!', editText: '' };
      component.enableEditComment(commentObj);
      expect(commentObj.isEditing).toBeTrue();
      expect(commentObj.editText).toBe('Lovely!');

      component.cancelEditComment(commentObj);
      expect(commentObj.isEditing).toBeFalse();
    });

    it('should add comment and refresh gallery on commentAdd()', () => {
      const commentObj = { isEditing: true };
      mockGalleryService.ManageComment.and.returnValue(of({
        message: 'comment added successfully.',
      }));
      spyOn(component, 'getStudentGallery');

      component.commentAdd(commentObj, 'add', '05-10-2026');

      expect(mockGalleryService.ManageComment).toHaveBeenCalled();
      expect(component.getStudentGallery).toHaveBeenCalled();
      expect(commentObj.isEditing).toBeFalse();
    });
  });
});
