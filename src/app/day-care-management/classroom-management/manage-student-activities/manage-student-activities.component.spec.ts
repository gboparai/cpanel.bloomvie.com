import { fakeAsync, tick } from '@angular/core/testing';
import Swal from 'sweetalert2';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageStudentActivitiesComponent } from './manage-student-activities.component';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClassroomDetailsService } from '../classroom-details/classroom-details.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { CommonService } from '../../../common-component/common.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

describe('ManageStudentActivitiesComponent', () => {
  let component: ManageStudentActivitiesComponent;
  let fixture: ComponentFixture<ManageStudentActivitiesComponent>;

  let mockRouter: jasmine.SpyObj<Router>;
  let mockClassroomDetailsService: jasmine.SpyObj<ClassroomDetailsService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockClassroomDetailsService = jasmine.createSpyObj('ClassroomDetailsService', [
      'getFoodType',
      'getTeacherAvailability',
      'getStudentActivityByActivityID',
      'getStudentByClassID',
      'getClassRoom',
      'getCentreWorkingDaysByCentreID',
    ]);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'check']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['uploadImages']);

    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'CentreID') return '10';
      if (key === 'UserId') return '3';
      if (key === 'UserRoleId') return '2';
      return '';
    });

    mockClassroomDetailsService.getFoodType.and.returnValue(
      of({ message: 'Success', result: [{ id: 1, foodType: 'Solid' }] })
    );
    mockClassroomDetailsService.getCentreWorkingDaysByCentreID.and.returnValue(
      of({
        message: 'Success',
        result: {
          sun: false,
          mon: true,
          tues: true,
          wed: true,
          thu: true,
          fri: true,
          sat: false,
          monStartTime: '08:00',
          monEndTime: '17:00',
        },
      })
    );
    mockClassroomDetailsService.getTeacherAvailability.and.returnValue(
      of({ message: 'Ok', result: [1, 2, 3, 4, 5] })
    );
    mockClassroomDetailsService.getClassRoom.and.returnValue(
      of({ message: 'OK', result: [{ classroomID: 1, className: 'Infant Room' }] })
    );

    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal'),
      val: jasmine.createSpy('val'),
    });

    await TestBed.configureTestingModule({
      imports: [ManageStudentActivitiesComponent, ReactiveFormsModule, FormsModule],
      providers: [
        FormBuilder,
        DatePipe,
        { provide: Router, useValue: mockRouter },
        { provide: ClassroomDetailsService, useValue: mockClassroomDetailsService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: CookieService, useValue: mockCookieService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: CommonService, useValue: mockCommonService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ManageStudentActivitiesComponent, {
        set: {
          imports: [ReactiveFormsModule, FormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ManageStudentActivitiesComponent);
    component = fixture.componentInstance;
  });

  it('should create ManageStudentActivitiesComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('Activity Forms Initialization', () => {
    it('should initialize all activity form groups', () => {
      expect(component.NapTimeForm).toBeDefined();
      expect(component.FoodForm).toBeDefined();
      expect(component.NoteForm).toBeDefined();
      expect(component.HealthForm).toBeDefined();
      expect(component.IncidentForm).toBeDefined();
      expect(component.MedicineForm).toBeDefined();
      expect(component.ReminderForm).toBeDefined();
      expect(component.uploadMediaForm).toBeDefined();
      expect(component.ClassAndSectionForm).toBeDefined();
    });

    it('should validate required fields in forms', () => {
      component.NapTimeForm.patchValue({ napDate: '', napStartTime: '', napEndTime: '' });
      expect(component.NapTimeForm.valid).toBeFalse();

      component.HealthForm.patchValue({ healthDate: '', healthTime: '', bodyTemperature: '' });
      expect(component.HealthForm.valid).toBeFalse();
    });
  });

  describe('ngOnInit & Data Fetching', () => {
    it('should set cookies, fetch food types, working timing, and teacher availability on init', () => {
      history.pushState({ activityID: null }, '');
      component.ngOnInit();

      expect(component.CenterID).toBe(10);
      expect(component.centreID).toBe(10);
      expect(component.teacherID).toBe(3);
      expect(mockClassroomDetailsService.getFoodType).toHaveBeenCalled();
      expect(mockClassroomDetailsService.getCentreWorkingDaysByCentreID).toHaveBeenCalledWith(10);
      expect(mockClassroomDetailsService.getTeacherAvailability).toHaveBeenCalledWith(3, 10);
      expect(component.teacherAvailabilityDays).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('Patch Activity Forms', () => {
    it('should patch NapTimeForm for activityId 1', () => {
      component.patchActivityForm({
        activityId: 1,
        date: '2026-10-25',
        startTime: '13:00',
        endTime: '14:30',
        note: 'Slept soundly',
      });
      expect(component.NapTimeForm.value.napStartTime).toBe('13:00');
      expect(component.NapTimeForm.value.napEndTime).toBe('14:30');
      expect(component.NapTimeForm.value.note).toBe('Slept soundly');
    });

    it('should patch FoodForm for activityId 2', () => {
      component.patchActivityForm({
        activityId: 2,
        date: '2026-10-25',
        startTime: '12:00',
        foodType: 1,
        mealType: 2,
        mealItem: 'Fruit bowl',
        note: 'Finished meal',
      });
      expect(component.FoodForm.value.mealItem).toBe('Fruit bowl');
      expect(component.FoodForm.value.note).toBe('Finished meal');
    });

    it('should patch HealthForm for activityId 4', () => {
      component.patchActivityForm({
        activityId: 4,
        date: '2026-10-25',
        startTime: '10:00',
        bodyTemperature: 98.4,
        note: 'Normal',
      });
      expect(component.HealthForm.value.bodyTemperature).toBe(98.4);
    });

    it('should patch IncidentForm for activityId 5', () => {
      component.patchActivityForm({
        activityId: 5,
        date: '2026-10-25',
        startTime: '11:00',
        note: 'Minor scratch',
      });
      expect(component.IncidentForm.value.note).toBe('Minor scratch');
    });

    it('should patch MedicineForm for activityId 6', () => {
      component.patchActivityForm({
        activityId: 6,
        date: '2026-10-25',
        startTime: '14:00',
        note: 'Given antibiotic',
      });
      expect(component.MedicineForm.value.note).toBe('Given antibiotic');
    });

    it('should patch ReminderForm for activityId 7', () => {
      component.patchActivityForm({
        activityId: 7,
        date: '2026-10-25',
        startTime: '16:00',
        note: 'Diaper pack needed',
      });
      expect(component.ReminderForm.value.note).toBe('Diaper pack needed');
    });

    it('should patch uploadMediaForm for activityId 8', () => {
      component.patchActivityForm({
        activityId: 8,
        date: '2026-10-25',
        note: 'Playground photos',
      });
      expect(component.uploadMediaForm.value.note).toBe('Playground photos');
    });
  });

  describe('Validation & Helpers', () => {
    it('should validate body temperature within 90 - 105', () => {
      component.validatingBodyTemperature({ target: { value: '98.6' } });
      expect(component.isTemperatureInvalid).toBeFalse();

      component.validatingBodyTemperature({ target: { value: '110' } });
      expect(component.isTemperatureInvalid).toBeTrue();
      expect(component.HealthForm.value.bodyTemperature).toBeNull();

      component.validatingBodyTemperature({ target: { value: 'not-a-number' } });
      expect(component.HealthForm.value.bodyTemperature).toBeNull();
    });

    it('should map mime types correctly', () => {
      expect(component.getMimeType('image/jpeg')).toBe('jpeg');
      expect(component.getMimeType('image/png')).toBe('png');
      expect(component.getMimeType('image/webp')).toBe('webp');
      expect(component.getMimeType('image/unknown')).toBe('png');
    });

    it('should switch MasterActivityID on onClickToAddMasterActivityID', () => {
      component.onClickToAddMasterActivityID(4, 'Health');
      expect(component.AcceptedMasterActivityID).toBe(4);
    });

    it('should store temp crop event and process single cropped image', () => {
      pending();
      const mockBlob = new Blob([''], { type: 'image/png' });
      const mockEvent = { blob: mockBlob } as any;

      component.storeTempCrop(mockEvent);
      expect(component.tempCroppedEvent).toBe(mockEvent);

      component.imageTypeFileForCrop = 'Health';
      component.activityMediaStats = { Health: { imageCount: 0, videoCount: 0, videoSizeMB: 0 } } as any;
      component.urlMap = { Health: [] };
      component.imageFileBlob = [];
      component.fileList = [];

      const mockElem = document.createElement('input');
      mockElem.id = 'HealthFileElement';
      document.body.appendChild(mockElem);

      component.processCroppedImageForSingle();

      expect(component.fileList.length).toBe(1);
      expect(component.singleImageUploadedFirst).toBeTrue();

      document.body.removeChild(mockElem);
    });
  });

  describe('Error handling', () => {
    it('should handle invalid base64 image gracefully', () => {
      spyOn(console, 'error');

      const mockActivityId = 1;

      // We will provide a malformed string or getter throwing error for rawUrl to trigger catch block in getActivity
      // However the loop logic has try catch inside getStudentActivityByActivityID.
      const throwingImage = {
        get base64Image() {
          throw new Error('Test Error');
        }
      };

      mockClassroomDetailsService.getStudentActivityByActivityID.and.returnValue(
        of({
          message: 'Success',
          result: {
            activity: { activityId: mockActivityId },
            activityImages: [throwingImage]
          }
        })
      );

      component.getStudentActivityByActivityID(mockActivityId);

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('UploadFiles', () => {
    it('should upload files and return response successfully (Happy Path)', async () => {
      const mockData = new FormData();
      mockData.append('test', 'value');
      const mockResponse = { message: 'OK', result: [] };

      mockCommonService.uploadImages.and.returnValue(of(mockResponse));

      const response = await component.UploadFiles(mockData);

      expect(mockCommonService.uploadImages).toHaveBeenCalledWith(mockData);
      expect(response).toEqual(mockResponse);
    });

    it('should catch and rethrow error when commonService.uploadImages fails (Error Path)', async () => {
      const mockData = new FormData();
      const mockError = new Error('Upload failed');

      mockCommonService.uploadImages.and.returnValue(throwError(() => mockError));

      try {
        await component.UploadFiles(mockData);
        fail('Expected UploadFiles to throw an error');
      } catch (error) {
        expect(mockCommonService.uploadImages).toHaveBeenCalledWith(mockData);
        expect(error).toBe(mockError);
      }
    });
  });

  describe('handleStudentActivitySubmit', () => {
    it('should handle file upload error in the catch block', async () => {
      spyOn(console, 'error');

      const mockError = new Error('Upload failed');
      mockCommonService.uploadImages.and.returnValue(throwError(() => mockError));

      component.SelectedStudentId = [1];
      component.NapTimeForm.patchValue({
        napDate: '2023-10-25',
        napStartTime: '10:00',
        napEndTime: '11:00'
      });

      // we need to set fileList so that it reaches the UploadFiles method
      component.fileList = [{ files: 'dummy', type: 'image/png' }];

      await component.handleStudentActivitySubmit(
        component.NapTimeForm,
        'NapTime',
        [],
        { nativeElement: { value: '' } } as any
      );

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('File upload error:', mockError);
      expect(mockToastr.error).toHaveBeenCalledWith('Error occurred during file upload.');
      expect(mockSpinner.hide).toHaveBeenCalled();
    });
  });
  describe('studentGalleryDelete', () => {
    it('should catch unexpected errors and show error toastr', async () => {
      spyOn(console, 'error');

      // Passing null for 'image' will cause 'image.imageID' to throw a TypeError
      await component.studentGalleryDelete({}, null);

      expect(mockToastr.error).toHaveBeenCalledWith('Unexpected error occurred.', 'Error');
      expect(console.error).toHaveBeenCalledWith('Unexpected error:', jasmine.any(TypeError));
    });
  });

  describe('deleteFile error handling', () => {
    it('should show error alert when studentGalleryDelete throws an error', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true }) as any);
      spyOn(component, 'studentGalleryDelete').and.returnValue(Promise.reject('error'));
      const galleryID = 1;
      const fileUrl = {
        documentPath: 'path',
        documentImage: 'image.png'
      };
      component.deleteFile(galleryID, fileUrl);
      tick();
      expect(Swal.fire).toHaveBeenCalledWith('Error!', 'An unexpected error occurred while deleting the file.', 'error');
    }));
  });
});
