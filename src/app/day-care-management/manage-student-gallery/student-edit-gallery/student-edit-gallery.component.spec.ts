import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentEditGalleryComponent } from './student-edit-gallery.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ManageStudentGalleryService } from '../manage-student-gallery.service';
import { CookieService } from 'ngx-cookie-service';
import { CommonService } from '../../../common-component/common.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ClassroomDetailsService } from '../../classroom-management/classroom-details/classroom-details.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

describe('StudentEditGalleryComponent', () => {
  let component: StudentEditGalleryComponent;
  let fixture: ComponentFixture<StudentEditGalleryComponent>;
  let mockGalleryService: jasmine.SpyObj<ManageStudentGalleryService>;
  let mockClassroomService: jasmine.SpyObj<ClassroomDetailsService>;
  let mockCookie: jasmine.SpyObj<CookieService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {
    mockGalleryService = jasmine.createSpyObj('ManageStudentGalleryService', [
      'getStudentGalleryByStudentID',
      'studentGalleryDelete',
      'ManageComment',
      'GetComment',
      'getParentDetails',
    ]);
    mockClassroomService = jasmine.createSpyObj('ClassroomDetailsService', [
      'getClassRoom',
      'getStudentByClassID',
    ]);
    mockCookie = jasmine.createSpyObj('CookieService', ['get', 'check']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['uploadImages']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'warning', 'error', 'info']);

    mockCookie.get.and.callFake((key: string) => {
      if (key === 'CentreID') return '10';
      if (key === 'UserId') return '25';
      if (key === 'UserRoleId') return '3';
      if (key === 'AdminName') return 'Admin User';
      return '';
    });

    mockClassroomService.getClassRoom.and.returnValue(of({ message: 'OK', result: [{ classroomID: 1, name: 'Toddler' }] }));
    mockClassroomService.getStudentByClassID.and.returnValue(of({ message: 'Success', result: [{ id: 101, name: 'Alice' }] }));
    mockGalleryService.getStudentGalleryByStudentID.and.returnValue(of({ message: 'Success', result: [{ id: 50, filePath: 'img.jpg' }] }));
    mockGalleryService.getParentDetails.and.returnValue(of({ message: 'Success', result: { fatherName: 'Bob' } }));

    await TestBed.configureTestingModule({
      imports: [StudentEditGalleryComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        DatePipe,
        { provide: ManageStudentGalleryService, useValue: mockGalleryService },
        { provide: ClassroomDetailsService, useValue: mockClassroomService },
        { provide: CookieService, useValue: mockCookie },
        { provide: CommonService, useValue: mockCommonService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: ToastrService, useValue: mockToastr },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(StudentEditGalleryComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(StudentEditGalleryComponent);
    component = fixture.componentInstance;
  });

  it('should create StudentEditGalleryComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization and Forms', () => {
    it('should initialize StudentGalleryForm controls and default date', () => {
      expect(component.StudentGalleryForm.contains('classRoomID')).toBeTrue();
      expect(component.StudentGalleryForm.contains('activityDate')).toBeTrue();
      expect(component.StudentGalleryForm.contains('studentID')).toBeTrue();
      expect(component.formattedDate).toBeDefined();
    });

    it('should read cookies and call getClassRoom in ngOnInit', () => {
      spyOn(component, 'getClassRoom');
      component.ngOnInit();

      expect(component.daycareID).toBe('10');
      expect(component.teacherID).toBe(25);
      expect(component.userRoleId).toBe(3);
      expect(component.teacherName).toBe('Admin User');
      expect(component.getClassRoom).toHaveBeenCalled();
    });
  });

  describe('Class & Student Selection', () => {
    it('should handle onSelectClass and call getStudentByClassID', async () => {
      spyOn(component, 'getStudentByClassID');
      await component.onSelectClass({ classroomID: 2 });

      expect(component.classID).toBe(2);
      expect(component.getStudentByClassID).toHaveBeenCalled();
    });

    it('should handle onSelectStudent and store selectStudent', async () => {
      await component.onSelectStudent({ id: 88 });
      expect(component.selectStudent).toBe(88);
    });

    it('should fetch classrooms via getClassRoom', async () => {
      component.daycareID = '10';
      component.teacherID = 25;
      component.userRoleId = 3;

      await component.getClassRoom();

      expect(mockClassroomService.getClassRoom).toHaveBeenCalledWith('10', 25, 3);
      expect(component.classRoom).toEqual([{ classroomID: 1, name: 'Toddler' }]);
      expect(mockSpinner.hide).toHaveBeenCalled();
    });

    it('should fetch students via getStudentByClassID', async () => {
      component.daycareID = '10';
      component.classID = 1;
      component.name = '';

      await component.getStudentByClassID();

      expect(mockClassroomService.getStudentByClassID).toHaveBeenCalledWith('10', 1, '');
      expect(component.StudentList).toEqual([{ id: 101, name: 'Alice' }]);
      expect(mockSpinner.hide).toHaveBeenCalled();
    });
  });

  describe('Date and Gallery retrieval', () => {
    it('should handle onSelectStartDate and call getStudentGallery', async () => {
      spyOn(component, 'getStudentGallery');
      const event = { target: { value: '2026-03-01' } };

      await component.onSelectStartDate(event);

      expect(component.startDate).toBe('2026-03-01');
      expect(component.endDate).toBe('');
      expect(component.getStudentGallery).toHaveBeenCalled();
    });

    it('should handle onSelectEndDate and call getStudentGallery', async () => {
      spyOn(component, 'getStudentGallery');
      const event = { target: { value: '2026-03-15' } };

      await component.onSelectEndDate(event);

      expect(component.endDate).toBe('2026-03-15');
      expect(component.getStudentGallery).toHaveBeenCalled();
    });

    it('should fetch student gallery in getStudentGallery', async () => {
      component.selectStudent = 101;
      component.startDate = '2026-03-01';
      component.endDate = '2026-03-15';
      spyOn(component, 'getParentDetails');

      await component.getStudentGallery();

      expect(component.getParentDetails).toHaveBeenCalled();
      expect(mockGalleryService.getStudentGalleryByStudentID).toHaveBeenCalledWith(101, '2026-03-01', '2026-03-15');
      expect(component.gallery).toEqual([{ id: 50, filePath: 'img.jpg' }]);
    });
  });

  describe('File Helpers and Deletion', () => {
    it('should check if file is video correctly', () => {
      expect(component.isVideo('video.mp4')).toBeTrue();
      expect(component.isVideo('clip.mov')).toBeTrue();
      expect(component.isVideo('picture.jpg')).toBeFalse();
    });

    it('should return early on deleteFile if file is empty', () => {
      spyOn(Swal, 'fire');
      component.deleteFile(1, '');
      expect(Swal.fire).not.toHaveBeenCalled();
    });

    it('should call studentGalleryDelete when confirmed in Swal', async () => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      spyOn(component, 'studentGalleryDelete').and.returnValue(Promise.resolve());

      component.deleteFile(5, 'photo.jpg');
      await fixture.whenStable();

      expect(component.studentGalleryDelete).toHaveBeenCalledWith(5, 'photo.jpg');
    });

    it('should delete student gallery item in studentGalleryDelete', async () => {
      component.gallery = [{ id: 5 }, { id: 6 }];
      mockGalleryService.studentGalleryDelete.and.returnValue(of({ message: 'Success' }));
      spyOn(component, 'getStudentGallery');

      await component.studentGalleryDelete(5, 'photo.jpg');

      expect(mockGalleryService.studentGalleryDelete).toHaveBeenCalledWith(5, 'photo.jpg');
      expect(mockToastr.success).toHaveBeenCalledWith('Gallery item deleted successfully!', 'Success');
      expect(component.gallery.length).toBe(1);
    });
  });

  describe('Comments management', () => {
    it('should enable and cancel edit comment', () => {
      const item = { teacherComment: 'Great job!', isEditing: false, editText: '' };
      component.enableEditComment(item);
      expect(item.isEditing).toBeTrue();
      expect(item.editText).toBe('Great job!');

      component.cancelEditComment(item);
      expect(item.isEditing).toBeFalse();
      expect(item.editText).toBe('');
    });

    it('should add comment successfully in commentAdd', () => {
      component.teacherID = 25;
      const commentItem = { isEditing: true };
      mockGalleryService.ManageComment.and.returnValue(of({ message: 'comment added successfully.' }));
      spyOn(component, 'getStudentGallery');

      component.commentAdd('Well done!', 'add', '2026-03-01');

      expect(mockGalleryService.ManageComment).toHaveBeenCalledWith(25, 'Well done!', 'add', '2026-03-01', 'teacher');
      expect(component.getStudentGallery).toHaveBeenCalled();
    });

    it('should clear newCommentText in cancelComment()', () => {
      component.newCommentText = 'Draft';
      component.cancelComment();
      expect(component.newCommentText).toBe('');
    });

    it('should fetch comments with getComment()', async () => {
      component.teacherID = 25;
      component.startDate = '2026-03-01';
      mockGalleryService.GetComment.and.returnValue(of({ message: 'Success', result: [{ id: 1 }] }));

      await component.getComment();

      expect(mockGalleryService.GetComment).toHaveBeenCalledWith(25, '2026-03-01');
      expect(component.comment).toEqual([{ id: 1 }]);
    });

    it('should fetch parent details in getParentDetails()', async () => {
      component.selectStudent = 101;
      await component.getParentDetails();
      expect(mockGalleryService.getParentDetails).toHaveBeenCalledWith(101);
      expect(component.parent).toEqual({ fatherName: 'Bob' });
    });

    it('should reset form on ResetForm()', () => {
      spyOn(component.StudentGalleryForm, 'reset');
      component.ResetForm();
      expect(component.StudentGalleryForm.reset).toHaveBeenCalled();
    });
  });
});
