import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ManageStudentGalleryComponent } from './manage-student-gallery.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ManageStudentGalleryService } from './manage-student-gallery.service';
import { ClassroomDetailsService } from '../classroom-management/classroom-details/classroom-details.service';
import { CookieService } from 'ngx-cookie-service';
import { CommonService } from '../../common-component/common.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ElementRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

describe('ManageStudentGalleryComponent', () => {
  let component: ManageStudentGalleryComponent;
  let fixture: ComponentFixture<ManageStudentGalleryComponent>;
  let mockGalleryService: jasmine.SpyObj<ManageStudentGalleryService>;
  let mockClassroomDetailsService: jasmine.SpyObj<ClassroomDetailsService>;
  let mockCookie: jasmine.SpyObj<CookieService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {
    mockGalleryService = jasmine.createSpyObj('ManageStudentGalleryService', [
      'dayCareCentreStudentGallery',
      'getStudentBySectionID',
    ]);
    mockClassroomDetailsService = jasmine.createSpyObj('ClassroomDetailsService', [
      'getClassRoom',
      'getStudentByClassID',
    ]);
    mockCookie = jasmine.createSpyObj('CookieService', ['get', 'check']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['uploadImages']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);

    mockCookie.get.and.callFake((key: string) => {
      if (key === 'CentreID') return '10';
      if (key === 'UserId') return '25';
      if (key === 'UserRoleId') return '3';
      return '';
    });
    mockClassroomDetailsService.getClassRoom.and.returnValue(of({ message: 'OK', result: [{ id: 1, name: 'Room A' }] }));
    mockClassroomDetailsService.getStudentByClassID.and.returnValue(of({ message: 'Success', result: [{ id: 101, name: 'Student 1' }] }));
    mockGalleryService.getStudentBySectionID.and.returnValue(of({ message: 'Success', result: [{ id: 201 }] }));

    await TestBed.configureTestingModule({
      imports: [ManageStudentGalleryComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: ManageStudentGalleryService, useValue: mockGalleryService },
        { provide: ClassroomDetailsService, useValue: mockClassroomDetailsService },
        { provide: CookieService, useValue: mockCookie },
        { provide: CommonService, useValue: mockCommonService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: ToastrService, useValue: mockToastr },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ManageStudentGalleryComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ManageStudentGalleryComponent);
    component = fixture.componentInstance;

    // Mock FileInput ElementRef
    const dummyInput = document.createElement('input');
    dummyInput.type = 'file';
    component.FileInput = new ElementRef(dummyInput);
  });

  it('should create ManageStudentGalleryComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization and OnInit', () => {
    it('should initialize StudentGalleryForm with controls', () => {
      expect(component.StudentGalleryForm.contains('classRoomID')).toBeTrue();
      expect(component.StudentGalleryForm.contains('activityDate')).toBeTrue();
      expect(component.StudentGalleryForm.contains('studentID')).toBeTrue();
      expect(component.StudentGalleryForm.contains('activityName')).toBeTrue();
    });

    it('should read cookies and call getClassRoom in ngOnInit', () => {
      spyOn(component, 'getClassRoom');
      component.ngOnInit();

      expect(component.daycareID).toBe('10');
      expect(component.teacherID).toBe(25);
      expect(component.userRoleId).toBe(3);
      expect(component.getClassRoom).toHaveBeenCalled();
    });
  });

  describe('getClassRoom', () => {
    it('should fetch classrooms and assign to class property', async () => {
      component.daycareID = '10';
      component.teacherID = 25;
      component.userRoleId = 3;

      await component.getClassRoom();

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(mockClassroomDetailsService.getClassRoom).toHaveBeenCalledWith('10', 25, 3);
      expect(component.class).toEqual([{ id: 1, name: 'Room A' }]);
      expect(mockSpinner.hide).toHaveBeenCalled();
    });
  });

  describe('Class & Student Selection', () => {
    it('should reset fields if classRoomID is empty onSelectClass', async () => {
      component.StudentGalleryForm.patchValue({ classRoomID: '' });
      spyOn(component, 'resetFileInput');
      spyOn(component, 'getStudentListByClass');

      await component.onSelectClass({ classroomID: '5' });

      expect(component.resetFileInput).toHaveBeenCalled();
      expect(component.classID).toBe(5);
      expect(component.getStudentListByClass).toHaveBeenCalledWith(5);
    });

    it('should handle onSelectStudent by extracting student IDs', async () => {
      await component.onSelectStudent([{ id: 11 }, { id: 12 }]);
      expect(component.studentIDs).toEqual([11, 12]);
    });

    it('should fetch student list by class ID', async () => {
      component.daycareID = '10';
      await component.getStudentListByClass(5);

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(mockClassroomDetailsService.getStudentByClassID).toHaveBeenCalledWith('10', 5, '');
      expect(component.student).toEqual([{ id: 101, name: 'Student 1' }]);
      expect(mockSpinner.hide).toHaveBeenCalled();
    });

    it('should fetch student list by section ID', async () => {
      component.sectionID = 8;
      await component.getStudentList();

      expect(mockGalleryService.getStudentBySectionID).toHaveBeenCalledWith(8);
      expect(component.student).toEqual([{ id: 201 }]);
    });
  });

  describe('Date handling', () => {
    it('should update selectedDate on onChangeDate', async () => {
      const event = { target: { value: '2026-05-20' } };
      await component.onChangeDate(event);
      expect(component.selectedDate).toBe('2026-05-20');
    });
  });

  describe('Form Reset and File operations', () => {
    it('should reset form and file input on ResetForm()', () => {
      component.Urls = ['url1', 'url2'];
      component.ResetForm();

      expect(component.Urls).toEqual([]);
      expect(component.FileInput.nativeElement.value).toBe('');
    });

    it('should reset file input on resetFileInput()', () => {
      component.Urls = ['image.png'];
      component.FileInput.nativeElement.value = 'dummy.png';

      component.resetFileInput();

      expect(component.Urls).toEqual([]);
      expect(component.FileInput.nativeElement.value).toBe('');
    });

    it('should clear image path on clearImagePath()', () => {
      component.FileInput.nativeElement.value = 'test.png';
      component.clearImagePath();
      expect(component.FileInput.nativeElement.value).toBe('');
    });

    it('should delete file at index in DeleteFile', () => {
      component.Urls = ['url1', 'url2', 'url3'];
      component.fileList = [{ files: {} }, { files: {} }, { files: {} }];

      component.DeleteFile(1);

      expect(component.fileList.length).toBe(2);
      expect(component.fileCount).toBe(1);
    });

    it('should return file count getter', () => {
      component.Urls = ['a', 'b'];
      expect(component.fileCount).toBe(2);
    });
  });

  describe('onSubmit', () => {
    it('should mark all touched if form is invalid', async () => {
      component.StudentGalleryForm.patchValue({
        classRoomID: '',
        activityName: '',
      });

      await component.onSubmit();

      expect(mockGalleryService.dayCareCentreStudentGallery).not.toHaveBeenCalled();
    });

    it('should upload files and submit form when valid', async () => {
      component.StudentGalleryForm.patchValue({
        classRoomID: '5',
        activityName: 'Painting',
        activityDate: '01-10-2026',
        studentID: [1],
      });
      component.selectedDate = '2026-01-10';
      component.daycareID = '10';
      component.teacherID = 25;
      component.studentIDs = [1];
      component.fileList = [{ files: new File([''], 'art.jpg'), type: 'bulk' }];

      mockCommonService.uploadImages.and.returnValue(of({
        message: 'OK',
        result: [{ imageName: 'art_uploaded.jpg' }],
      }));
      mockGalleryService.dayCareCentreStudentGallery.and.returnValue(of({
        message: 'OK',
        activity: 'Gallery added successfully',
      }));

      await component.onSubmit();

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(mockGalleryService.dayCareCentreStudentGallery).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Gallery added successfully');
      expect(mockSpinner.hide).toHaveBeenCalled();
    });

    it('should handle error during file upload or submission', async () => {
      component.StudentGalleryForm.patchValue({
        classRoomID: '5',
        activityName: 'Painting',
        activityDate: '01-10-2026',
        studentID: [1],
      });
      component.fileList = [{ files: new File([''], 'art.jpg'), type: 'bulk' }];
      mockCommonService.uploadImages.and.returnValue(throwError(() => new Error('Upload error')));

      await component.onSubmit();

      expect(mockToastr.error).toHaveBeenCalledWith('Error occurred during file upload.');
      expect(mockSpinner.hide).toHaveBeenCalled();
    });
  });
});
