import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddBulkActivitesComponent } from './add-bulk-activites.component';
import { FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { UserRoleService } from '../../settings/Permission/user-role/user-role.service';
import { ApplicationsSettingsService } from '../../settings/application-settings/applications-settings/applications-settings.service';
import { ManageStaffService } from '../staff-management/add-staff/manage-staff.service';
import { AddBulkActivityService } from './add-bulk-activity.service';
import { ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { CommonService } from '../../common-component/common.service';
import { OnboardingService } from '../../onboarding/onboarding.service';
import { NO_ERRORS_SCHEMA, ElementRef } from '@angular/core';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

describe('AddBulkActivitesComponent', () => {
  let component: AddBulkActivitesComponent;
  let fixture: ComponentFixture<AddBulkActivitesComponent>;

  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockUserRoleService: jasmine.SpyObj<UserRoleService>;
  let mockAppSettingsService: jasmine.SpyObj<ApplicationsSettingsService>;
  let mockManageStaffService: jasmine.SpyObj<ManageStaffService>;
  let mockAddBulkService: jasmine.SpyObj<AddBulkActivityService>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockOnboardingService: jasmine.SpyObj<OnboardingService>;

  beforeEach(async () => {
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockUserRoleService = jasmine.createSpyObj('UserRoleService', ['getUserRoles']);
    mockAppSettingsService = jasmine.createSpyObj('ApplicationsSettingsService', ['UploadBulkActivitesOfStudent']);
    mockManageStaffService = jasmine.createSpyObj('ManageStaffService', ['downloadBulkUploadSheetForActivites']);
    mockAddBulkService = jasmine.createSpyObj('AddBulkActivityService', [
      'getTeacherAssignments',
      'getFoodType',
      'getMealType',
      'downloadInvalidRecordsSheet',
    ]);
    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'set', 'delete', 'check', 'deleteAll']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['decrypt', 'uploadImages']);
    mockOnboardingService = jasmine.createSpyObj('OnboardingService', ['getDetails']);

    mockAddBulkService.getTeacherAssignments.and.returnValue(
      of({
        message: 'OK',
        result: [
          {
            className: 'Toddlers',
            sections: [
              {
                sectionName: 'Section A',
                students: ['Alice | 101', 'Bob | 102'],
              },
            ],
          },
        ],
      })
    );
    mockAddBulkService.getFoodType.and.returnValue(
      of({
        message: 'Success',
        result: [{ id: 1, foodType: 'Solid' }],
      })
    );
    mockAddBulkService.getMealType.and.returnValue(
      of({
        message: 'Success',
        result: [{ id: 1, mealType: 'Breakfast' }, { id: 2, mealType: 'Lunch' }],
      })
    );

    mockCookieService.check.and.callFake((key: string) => {
      if (key === 'CentreID' || key === 'UserId') return true;
      return false;
    });
    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'CentreID') return '10';
      if (key === 'UserId') return '5';
      return '';
    });

    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal'),
    });

    await TestBed.configureTestingModule({
      imports: [AddBulkActivitesComponent],
      providers: [
        FormBuilder,
        DatePipe,
        { provide: ToastrService, useValue: mockToastr },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: UserRoleService, useValue: mockUserRoleService },
        { provide: ApplicationsSettingsService, useValue: mockAppSettingsService },
        { provide: ManageStaffService, useValue: mockManageStaffService },
        { provide: AddBulkActivityService, useValue: mockAddBulkService },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of({
              get: (k: string) => (k === 'enc_id' ? null : null),
            }),
          },
        },
        { provide: CookieService, useValue: mockCookieService },
        { provide: CommonService, useValue: mockCommonService },
        { provide: OnboardingService, useValue: mockOnboardingService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(AddBulkActivitesComponent, {
        set: { schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AddBulkActivitesComponent);
    component = fixture.componentInstance;
  });

  it('should create AddBulkActivitesComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization & Lifecycle', () => {
    it('should initialize centreID and loginUserID from cookies and fetch assignments & food/meal types', () => {
      component.ngOnInit();
      expect(component.centreID).toBe(10);
      expect(component.loginUserID).toBe(5);
      expect(mockAddBulkService.getTeacherAssignments).toHaveBeenCalledWith(5, 10);
      expect(mockAddBulkService.getFoodType).toHaveBeenCalled();
      expect(mockAddBulkService.getMealType).toHaveBeenCalled();
      expect(component.classList).toContain('Toddlers');
      expect(component.foodTypeList).toContain('Solid | 1');
      expect(component.mealTypeList).toContain('Breakfast');
    });

    it('should decrypt enc_id from query params if present', () => {
      const route = TestBed.inject(ActivatedRoute);
      Object.defineProperty(route, 'queryParamMap', {
        value: of({
          get: (k: string) => (k === 'enc_id' ? 'encrypted123' : null),
        } as any),
        configurable: true,
      });
      mockCommonService.decrypt.and.returnValue('25');

      component.ngOnInit();
      expect(component.centreID).toBe(25);
    });
  });

  describe('Time and Date helper methods', () => {
    it('should convert fractional time to string correctly', () => {
      // 0.5 of a day = 12:00:00
      const timeStr = component.convertFractionalTimeToString(0.5);
      expect(timeStr).toBe('12:00:00');
    });

    it('should throw an error for invalid fractional times', () => {
      expect(() => component.convertFractionalTimeToString(-0.1)).toThrow();
      expect(() => component.convertFractionalTimeToString(1.0)).toThrow();
    });

    it('should pad single digits with leading zero', () => {
      expect(component.pad(5)).toBe('05');
      expect(component.pad(12)).toBe('12');
    });

    it('should convert excel date to formatted string', () => {
      const result = component.convertExcelDate(44197, 'MM/dd/yyyy');
      expect(result).toBeDefined();
    });

    it('should validate excel date correctly', () => {
      expect(component.isValidExcelDate(44197)).toBeTrue();
      expect(component.isValidExcelDate('abc')).toBeFalse();
      expect(component.isValidExcelDate(-5)).toBeFalse();
    });

    it('should validate date string format MM/dd/yyyy', () => {
      expect(component.isValidDateString('12/25/2026')).toBeTrue();
      expect(component.isValidDateString('2026-12-25')).toBeFalse();
      expect(component.isValidDateString('13/25/2026')).toBeFalse();
    });

    it('should validate excel time range (0 to 1)', () => {
      expect(component.isValidExcelTime(0.25)).toBeTrue();
      expect(component.isValidExcelTime(1.5)).toBeFalse();
      expect(component.isValidExcelTime(-0.1)).toBeFalse();
    });

    it('should validate time string format HH:mm:ss', () => {
      expect(component.isValidTimeString('14:30:00')).toBeTrue();
      expect(component.isValidTimeString('25:00:00')).toBeFalse();
      expect(component.isValidTimeString('invalid')).toBeFalse();
    });
  });

  describe('Modal and File operations', () => {
    it('should open modal on onBulkUploadClick', () => {
      const dummyElem = document.createElement('div');
      dummyElem.id = 'exampleModal';
      document.body.appendChild(dummyElem);

      component.onBulkUploadClick();
      expect((window as any).$).toHaveBeenCalledWith('#exampleModal');

      document.body.removeChild(dummyElem);
    });

    it('should handle fileChange event and set uploadedFiles', () => {
      const mockFileList = [{ name: 'test.jpg' }] as any;
      component.fileChange({ target: { files: mockFileList } });
      expect(component.uploadedFiles).toBe(mockFileList);
    });

    it('should upload files using commonService', async () => {
      const formData = new FormData();
      mockCommonService.uploadImages.and.returnValue(of({ message: 'OK', result: [] }) as any);

      const res = await component.uploadFiles(formData);
      expect(res.message).toBe('OK');
      expect(mockCommonService.uploadImages).toHaveBeenCalledWith(formData);
    });

    it('should show error alert if selectUploadedFile is called without files', () => {
      spyOn(Swal, 'fire');
      component.uploadedFiles = undefined;
      const event = { target: { files: [new File([], 'test.xlsx')], value: 'foo' } };

      component.selectUploadedFile(event);
      expect(Swal.fire).toHaveBeenCalledWith('Image not found!', 'please upload image', 'error');
      expect(event.target.value).toBe('');
    });

    it('should call UploadBulkExternalEmployeeDetail if uploadedFiles is present in selectUploadedFile', () => {
      component.uploadedFiles = [new File([], 'img.png')];
      spyOn(component, 'UploadBulkExternalEmployeeDetail');
      const event = { target: { files: [new File([], 'test.xlsx')] } };

      component.selectUploadedFile(event);
      expect(component.UploadedFile).toBeDefined();
      expect(component.UploadBulkExternalEmployeeDetail).toHaveBeenCalled();
    });

    it('should clear file input values and references on clearFileInput', () => {
      component.FileInput = { nativeElement: { value: 'file1' } } as ElementRef;
      component.FileInputBulk = { nativeElement: { value: 'file2' } } as ElementRef;
      component.UploadedFile = {} as any;
      component.uploadedFiles = {} as any;

      component.clearFileInput();

      expect(component.FileInput.nativeElement.value).toBe('');
      expect(component.FileInputBulk.nativeElement.value).toBe('');
      expect(component.UploadedFile).toBeNull();
      expect(component.uploadedFiles).toBeNull();
    });
  });

  describe('Download Methods', () => {
    it('should download bulk format sheet successfully', () => {
      component.centreID = 10;
      component.loginUserID = 5;
      const b64 = btoa('test excel content');
      mockManageStaffService.downloadBulkUploadSheetForActivites.and.returnValue(
        of({ message: 'Success', result: b64 })
      );
      spyOn(window.URL, 'createObjectURL').and.returnValue('blob:test');
      spyOn(window.URL, 'revokeObjectURL');

      component.downloadBulkFormatSheet();

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(mockManageStaffService.downloadBulkUploadSheetForActivites).toHaveBeenCalledWith(10, 5);
      expect(mockSpinner.hide).toHaveBeenCalled();
    });

    it('should show error toastr if downloadBulkFormatSheet fails', () => {
      component.centreID = 10;
      component.loginUserID = 5;
      mockManageStaffService.downloadBulkUploadSheetForActivites.and.returnValue(
        throwError(() => new Error('Download failed'))
      );

      component.downloadBulkFormatSheet();

      expect(mockToastr.error).toHaveBeenCalledWith('Failed to download the Excel file.');
      expect(mockSpinner.hide).toHaveBeenCalled();
    });

    it('should download invalid records sheet successfully', () => {
      component.centreID = 10;
      component.loginUserID = 5;
      const b64 = btoa('invalid records excel');
      mockAddBulkService.downloadInvalidRecordsSheet.and.returnValue(
        of({ message: 'Success', result: b64 })
      );
      spyOn(window.URL, 'createObjectURL').and.returnValue('blob:test');
      spyOn(window.URL, 'revokeObjectURL');

      component.downloadInvalidRecordsSheet();

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(mockAddBulkService.downloadInvalidRecordsSheet).toHaveBeenCalled();
      expect(mockSpinner.hide).toHaveBeenCalled();
    });
  });

  describe('Record Parsing & View Helpers', () => {
    it('should parse skipped Food records into FoodSkippedRecords', () => {
      component.skipRecords.Food = [
        {
          Students: 'Alice | 101',
          'Select Date': '10/15/2026',
          'Select Time': '12:00:00',
          'Food Type': 'Solid | 1',
          'Meal Type': 'Lunch',
          'Meal Item': 'Apple',
          Note: 'Ate well',
          Images: 'pic.jpg',
          Class: 'Toddlers',
        },
      ];

      component.viewFoodRecord();

      expect(component.FoodSkippedRecords.length).toBe(1);
      expect(component.FoodSkippedRecords[0].studentName).toBe('Alice');
      expect(component.FoodSkippedRecords[0].foodType).toBe('Solid');
      expect(component.FoodSkippedRecords[0].mealItem).toBe('Apple');
    });

    it('should parse skipped Medicine records into MedicineSkippedRecords', () => {
      component.skipRecords.Medicine = [
        {
          Students: 'Bob | 102',
          'Select Date': '10/15/2026',
          'Select Time': '10:00:00',
          Note: 'Cough syrup',
          Images: 'med.jpg',
          Class: 'Toddlers',
        },
      ];

      component.viewMedicineRecord();

      expect(component.MedicineSkippedRecords.length).toBe(1);
      expect(component.MedicineSkippedRecords[0].studentName).toBe('Bob');
      expect(component.MedicineSkippedRecords[0].note).toBe('Cough syrup');
    });

    it('should parse skipped Health records into HealthSkippedRecords', () => {
      component.skipRecords.Health = [
        {
          Students: 'Charlie | 103',
          'Select Date': '10/15/2026',
          'Select Time': '09:00:00',
          'Body Temperature': '98.6',
          Note: 'Normal temp',
          Images: 'temp.jpg',
          Class: 'Toddlers',
        },
      ];

      component.viewHealthRecord();

      expect(component.HealthSkippedRecords.length).toBe(1);
      expect(component.HealthSkippedRecords[0].bodyTemp).toBe('98.6');
    });

    it('should parse skipped Note records into NoteSkippedRecords', () => {
      component.skipRecords.Note = [
        {
          Students: 'David | 104',
          'Select Date': '10/15/2026',
          Time: '11:00:00',
          Note: 'Happy child',
          Images: 'happy.jpg',
          Class: 'Toddlers',
        },
      ];

      component.viewNoteRecord();

      expect(component.NoteSkippedRecords.length).toBe(1);
      expect(component.NoteSkippedRecords[0].note).toBe('Happy child');
    });

    it('should parse skipped Incident records into IncidentSkippedRecords', () => {
      component.skipRecords.Incident = [
        {
          Students: 'Emma | 105',
          'Select Date': '10/15/2026',
          'Select Time': '14:00:00',
          Note: 'Scraped knee',
          Images: 'knee.jpg',
          Class: 'Toddlers',
        },
      ];

      component.viewIncidentRecord();

      expect(component.IncidentSkippedRecords.length).toBe(1);
      expect(component.IncidentSkippedRecords[0].note).toBe('Scraped knee');
    });
  });

  describe('manageBulkUpload', () => {
    it('should show error if no file selected', () => {
      spyOn(Swal, 'fire');
      component.UploadedFile = null;

      component.manageBulkUpload();

      expect(Swal.fire).toHaveBeenCalledWith('No file Selected!', 'please select file and upload', 'error');
    });

    it('should show error if file has no entries', () => {
      spyOn(Swal, 'fire');
      component.UploadedFile = new File([], 'bulk.xlsx');
      component.entries = [];

      component.manageBulkUpload();

      expect(Swal.fire).toHaveBeenCalledWith('File is Empty!', 'please fill the data then upload', 'error');
    });

    it('should successfully upload bulk activities and notify user', () => {
      component.UploadedFile = new File([], 'bulk.xlsx');
      component.entries = [{ activity: 'Nap' }];
      component.bulkActivities = { obj: component.entries };
      component.FileInput = { nativeElement: { value: '' } } as ElementRef;
      component.FileInputBulk = { nativeElement: { value: '' } } as ElementRef;
      component.skipRecords.NapTime = [
        {
          Students: 'Alice | 101',
          'Select Date': '10/15/2026',
          'Nap Start Time': '13:00:00',
          'Nap End Time': '14:00:00',
          Note: 'Good nap',
          Images: 'nap.jpg',
          Class: 'Toddlers',
        },
      ];

      mockAppSettingsService.UploadBulkActivitesOfStudent.and.returnValue(
        of({ message: 'OK' })
      );

      component.manageBulkUpload();

      expect(mockToastr.success).toHaveBeenCalledWith('Bulk Uploaded Successfully');
      expect(component.NapTimeSkippedRecords.length).toBe(1);
    });

    it('should show error toastr if UploadBulkActivitesOfStudent returns error message', () => {
      component.UploadedFile = new File([], 'bulk.xlsx');
      component.entries = [{ activity: 'Nap' }];
      mockAppSettingsService.UploadBulkActivitesOfStudent.and.returnValue(
        of({ message: 'Error' })
      );

      component.manageBulkUpload();

      expect(mockToastr.error).toHaveBeenCalledWith('Something went wrong !!');
    });
  });
});
