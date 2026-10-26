import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { ManageTeacherComponent } from './manage-teacher.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '../../common-component/common.service';
import { ToastrService } from 'ngx-toastr';
import { ManageTeacherService } from './manage-teacher.service';
import { ManageDaycareService } from '../../day-care-management/manage-daycare/manage-daycare.service';
import { CookieService } from 'ngx-cookie-service';
import Swal from 'sweetalert2';

describe('ManageTeacherComponent', () => {
  let component: ManageTeacherComponent;
  let fixture: ComponentFixture<ManageTeacherComponent>;

  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockTeacherService: jasmine.SpyObj<ManageTeacherService>;
  let mockDaycareService: jasmine.SpyObj<ManageDaycareService>;
  let mockCookie: jasmine.SpyObj<CookieService>;

  beforeEach(async () => {
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockCommonService = jasmine.createSpyObj('CommonService', [
      'getCountryList',
      'getStateListByCountryID',
      'getCitiesListByStateID',
      'uploadImages',
      'activeInactiveDocument'
    ]);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'info', 'warning']);
    mockTeacherService = jasmine.createSpyObj('ManageTeacherService', [
      'manageTeacher',
      'getuserBankingInfo'
    ]);
    mockDaycareService = jasmine.createSpyObj('ManageDaycareService', [
      'manageBankingInfo',
      'getDocumentTypeList',
      'getDocumentList',
      'manageDocument'
    ]);
    mockCookie = jasmine.createSpyObj('CookieService', ['get', 'set', 'delete', 'check']);

    mockCookie.get.and.callFake((key: string) => {
      if (key === 'UserId') return '101';
      if (key === 'DayCare_CenterID') return '1';
      return '';
    });

    mockCommonService.getCountryList.and.returnValue(
      of({ message: 'Success', result: [{ id: 1, countryName: 'Canada' }] })
    );
    mockCommonService.getStateListByCountryID.and.returnValue(
      of({ message: 'Success', result: [{ id: 10, stateName: 'Ontario' }] })
    );
    mockCommonService.getCitiesListByStateID.and.returnValue(
      of({ message: 'Success', result: [{ id: 100, cityName: 'Toronto' }] })
    );
    mockCommonService.uploadImages.and.returnValue(
      of({ message: 'OK', result: [{ path: '/uploads/', imageName: 'pic.jpg' }] })
    );
    mockCommonService.activeInactiveDocument.and.returnValue(
      of({ message: 'Success', activity: 'Status updated' })
    );

    mockDaycareService.getDocumentTypeList.and.returnValue(
      of({ message: 'OK', result: [{ id: 1, documentType: 'aadharcard' }] })
    );
    mockDaycareService.getDocumentList.and.returnValue(
      of({ message: 'Success', result: [] })
    );
    mockDaycareService.manageBankingInfo.and.returnValue(
      of({ message: 'Success', activity: 'Banking saved', result: 50 })
    );
    mockDaycareService.manageDocument.and.returnValue(
      of({ message: 'Success', result: true })
    );

    mockTeacherService.manageTeacher.and.returnValue(
      of({ message: 'Success', activity: 'Teacher added', result: 200 })
    );
    mockTeacherService.getuserBankingInfo.and.returnValue(
      of({
        message: 'Success',
        result: {
          id: 5,
          accountNumber: '12345678',
          bankName: 'RBC',
          bankAddress: 'Main St',
          institutionNumber: '001',
          transitNumber: '12345',
          postalCode: 'M1M 1M1'
        }
      })
    );

    // Mock global flatpickr and jQuery
    (window as any).flatpickr = jasmine.createSpy('flatpickr');
    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      flatpickr: jasmine.createSpy('flatpickr'),
      text: jasmine.createSpy('text')
    });

    await TestBed.configureTestingModule({
      imports: [ManageTeacherComponent, ReactiveFormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: CommonService, useValue: mockCommonService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: ManageTeacherService, useValue: mockTeacherService },
        { provide: ManageDaycareService, useValue: mockDaycareService },
        { provide: CookieService, useValue: mockCookie }
      ]
    })
    .overrideComponent(ManageTeacherComponent, {
      set: { imports: [ReactiveFormsModule], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageTeacherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component and initialize forms', () => {
    expect(component).toBeTruthy();
    expect(component.teacherForm).toBeDefined();
    expect(component.bankingDetailsForm).toBeDefined();
    expect(component.documentForm).toBeDefined();
    expect(component.UserID).toBe(101);
    expect(component.CentreID).toBe(1);
  });

  it('should return form controls from getters', () => {
    expect(component.adminFormControls).toBe(component.teacherForm.controls);
    expect(component.bankingDetailsFormControls).toBe(component.bankingDetailsForm.controls);
    expect(component.documentFormControls).toBe(component.documentForm.controls);
  });

  it('should initialize flatpickr in ngAfterViewInit', () => {
    component.ngAfterViewInit();
    expect((window as any).flatpickr).toHaveBeenCalled();
    expect((window as any).$).toHaveBeenCalledWith('#dob');
  });

  describe('allowOnlyNumericInput', () => {
    it('should allow numeric keys (0-9)', () => {
      const event = new KeyboardEvent('keypress', { key: '5' });
      spyOn(event, 'preventDefault');
      component.allowOnlyNumericInput(event);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('should allow navigation and editing keys like Backspace, Delete, Tab, ArrowLeft', () => {
      const event = new KeyboardEvent('keypress', { key: 'Backspace' });
      spyOn(event, 'preventDefault');
      component.allowOnlyNumericInput(event);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('should prevent non-numeric characters', () => {
      const event = new KeyboardEvent('keypress', { key: 'a' });
      spyOn(event, 'preventDefault');
      component.allowOnlyNumericInput(event);
      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  describe('Location cascading dropdowns', () => {
    it('should handle onChangeCountry and fetch states', fakeAsync(() => {
      component.teacherForm.patchValue({ cityID: 100, stateID: 10 });
      component.onChangeCountry(1);
      expect(component.teacherForm.get('cityID').value).toBeNull();
      expect(component.teacherForm.get('stateID').value).toBeNull();
      expect(component.stateList2.length).toBe(0);
      expect(mockCommonService.getStateListByCountryID).toHaveBeenCalledWith(1);
      tick(300);
      expect(component.stateList2.length).toBe(1);
    }));

    it('should handle onChangeState and fetch cities', fakeAsync(() => {
      component.teacherForm.patchValue({ cityID: 100 });
      component.onChangeState(10);
      expect(component.teacherForm.get('cityID').value).toBeNull();
      expect(component.cityList2.length).toBe(0);
      expect(mockCommonService.getCitiesListByStateID).toHaveBeenCalledWith(10);
      tick(300);
      expect(component.cityList2.length).toBe(1);
    }));

    it('should handle error when getStateListByCountryID fails', fakeAsync(() => {
      mockCommonService.getStateListByCountryID.and.returnValue(throwError(() => new Error('State error')));
      component.getStateListByCountryID(1);
      expect(mockSpinner.hide).toHaveBeenCalled();
      expect(mockToastr.error).toHaveBeenCalledWith('State error');
    }));

    it('should handle error when getCitiesListByStateID fails', fakeAsync(() => {
      mockCommonService.getCitiesListByStateID.and.returnValue(throwError(() => new Error('City error')));
      component.getCityListByStateID(10);
      expect(mockSpinner.hide).toHaveBeenCalled();
      expect(mockToastr.error).toHaveBeenCalledWith('City error');
    }));
  });

  describe('validateForms and registerTeacher', () => {
    it('should return false from validateForms when teacherForm is invalid', () => {
      component.teacherForm.reset();
      const valid = component.validateForms();
      expect(valid).toBeFalse();
      expect(component.filesErrors.profile).toBe('This field is required.');
    });

    it('should return true from validateForms when teacherForm is valid and file exists', () => {
      component.teacherForm.patchValue({
        id: 0,
        centreID: 1,
        userRoleID: 4,
        firstName: 'Jane',
        email: 'jane@test.com',
        mobile: '1234567890',
        gender: 'F',
        countryID: 1,
        stateID: 10,
        cityID: 100,
        dob: '1990-01-01',
        pinCode: 'A1A 1A1',
        address: '123 Main'
      });
      (component as any).files.profile = new File(['dummy'], 'profile.jpg', { type: 'image/jpeg' });

      const valid = component.validateForms();
      expect(valid).toBeTrue();
      expect(component.filesErrors.profile).toBeNull();
    });

    it('should registerTeacher when validation passes and upload files', fakeAsync(() => {
      spyOn(component, 'validateForms').and.returnValue(true);
      (component as any).files.profile = new File(['dummy'], 'profile.jpg', { type: 'image/jpeg' });
      component.teacherForm.patchValue({
        id: 0,
        firstName: 'Jane',
        email: 'jane@test.com',
        mobile: '1234567890',
        gender: 'F',
        countryID: 1,
        stateID: 10,
        cityID: 100,
        dob: '1990-01-01',
        pinCode: 'A1A 1A1',
        address: '123 Main'
      });

      component.registerTeacher();
      tick(500);

      expect(mockCommonService.uploadImages).toHaveBeenCalled();
      expect(mockTeacherService.manageTeacher).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Teacher added');
      expect(component.teacherData).toBe(200);
      expect(component.bankingDetailsForm.get('accountHolderName').value).toBe('Jane');
    }));

    it('should handle registerTeacher failure response from API', fakeAsync(() => {
      spyOn(component, 'validateForms').and.returnValue(true);
      (component as any).files.profile = new File(['dummy'], 'profile.jpg', { type: 'image/jpeg' });
      mockTeacherService.manageTeacher.and.returnValue(of({ message: 'Failed', result: null }));

      component.registerTeacher();
      tick(500);

      expect(mockToastr.error).toHaveBeenCalledWith('Failed');
    }));

    it('should handle registerTeacher error response from API', fakeAsync(() => {
      spyOn(component, 'validateForms').and.returnValue(true);
      (component as any).files.profile = new File(['dummy'], 'profile.jpg', { type: 'image/jpeg' });
      mockTeacherService.manageTeacher.and.returnValue(throwError(() => new Error('Server error')));

      component.registerTeacher();
      tick(500);

      expect(mockToastr.error).toHaveBeenCalledWith('Server error');
    }));
  });

  describe('Banking Information', () => {
    it('should submit manageBankingInfo when valid', fakeAsync(() => {
      component.teacherData = 200;
      component.bankingDetailsForm.patchValue({
        bankName: 'TD Bank',
        bankAddress: 'Bay St',
        accountNumber: '11223344',
        institutionNumber: '004',
        transitNumber: '12345',
        postalCode: 'M5H 2N2'
      });

      component.manageBankingInfo();
      expect(mockDaycareService.manageBankingInfo).toHaveBeenCalled();
      tick(300);
      expect(mockToastr.success).toHaveBeenCalledWith('Banking saved');
      expect(component.bankingDetailsForm.get('id').value).toBe(50);
    }));

    it('should markAllAsTouched on manageBankingInfo if form is invalid', () => {
      component.bankingDetailsForm.reset();
      component.manageBankingInfo();
      expect(mockDaycareService.manageBankingInfo).not.toHaveBeenCalled();
      expect(component.bankingDetailsForm.touched).toBeTrue();
    });

    it('should handle onTabChange for Tab-2 and fetch banking details', fakeAsync(() => {
      component.teacherForm.patchValue({ firstName: 'Alice' });
      component.teacherData = 200;
      component.onTabChange('Tab-2');

      expect(component.bankingDetailsForm.get('accountHolderName').value).toBe('Alice');
      expect(mockTeacherService.getuserBankingInfo).toHaveBeenCalledWith(200);
      tick(300);
      expect(component.bankingDetailsForm.get('accountNumber').value).toBe('12345678');
      expect(component.bankingDetailsForm.get('bankName').value).toBe('RBC');
    }));

    it('should handle onTabChange for other tabs', () => {
      component.onTabChange('Tab-3');
      expect(mockTeacherService.getuserBankingInfo).not.toHaveBeenCalled();
    });
  });

  describe('Document Handling', () => {
    it('should validate onChangeDocumentType for aadharcard, pancard, and votercard', () => {
      component.onChangeDocumentType('aadharcard');
      const docControl = component.documentForm.get('documentNumber');
      docControl.setValue('123456789012');
      expect(docControl.valid).toBeTrue();
      docControl.setValue('invalid');
      expect(docControl.valid).toBeFalse();

      component.onChangeDocumentType('pancard');
      docControl.setValue('ABCDE1234F');
      expect(docControl.valid).toBeTrue();
      docControl.setValue('123');
      expect(docControl.valid).toBeFalse();

      component.onChangeDocumentType('votercard');
      docControl.setValue('ABC1234567');
      expect(docControl.valid).toBeTrue();

      component.onChangeDocumentType('other');
      expect(docControl.validator).toBeNull();
    });

    it('should validate and add document to documentList', async () => {
      component.documentTypeList = [{ id: 1, documentType: 'ID Card' }];
      component.documentForm.patchValue({
        id: 0,
        documentTypeID: 1,
        documentNumber: '12345',
        isActive: true
      });
      (component as any).files.document = new File(['dummy'], 'doc.pdf', { type: 'application/pdf' });

      await component.addDocument();
      expect(component.documentList.length).toBe(1);
      expect(component.documentList[0].documentType).toBe('ID Card');
    });

    it('should edit document and patch documentForm with onEditDocument', () => {
      const doc = {
        id: 10,
        documentTypeID: 1,
        documentNumber: 'DOC-99',
        documentImage: 'img.png',
        documentImagePath: '/path/',
        documentDescription: 'Passport',
        isActive: true
      };

      component.onEditDocument(doc, 0);
      expect(component.documentForm.get('id').value).toBe(10);
      expect(component.documentForm.get('documentNumber').value).toBe('DOC-99');
    });

    it('should return correct background image url in getBackgroundImageUrl', () => {
      expect(component.getBackgroundImageUrl({ readFile: 'data:image/png;base64,...' })).toBe('url(data:image/png;base64,...)');
      expect(component.getBackgroundImageUrl({ documentImagePath: 'path/', documentImage: 'file.png' })).toContain('url(');
      expect(component.getBackgroundImageUrl(null)).toBe('none');
    });

    it('should handle onSubmitDocumentList and upload pending files', async () => {
      const docWithFile = {
        id: 0,
        file: new File(['dummy'], 'file.png', { type: 'image/png' })
      };
      component.documentList = [docWithFile];

      await component.onSubmitDocumentList();
      expect(mockCommonService.uploadImages).toHaveBeenCalled();
      expect(mockDaycareService.manageDocument).toHaveBeenCalled();
    });

    it('should handle activeInactiveDocument after confirmation', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      component.activeInactiveDocument(10, true);
      tick(500);

      expect(mockCommonService.activeInactiveDocument).toHaveBeenCalledWith(10);
      expect(mockToastr.success).toHaveBeenCalledWith('Status updated');
    }));
  });

  describe('File reading and change handlers', () => {
    it('should reject invalid file types in onFileChange', async () => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({} as any));
      const file = new File([''], 'file.txt', { type: 'text/plain' });
      const event = { target: { files: [file] } };

      await component.onFileChange(false, event);
      expect(Swal.fire).toHaveBeenCalled();
    });

    it('should do nothing if no file selected in onFileChange', async () => {
      const event = { target: { files: [] } };
      await component.onFileChange(false, event);
      expect(component.readFiles.profile).toBe('assets/img/image-selector-profile.jpg');
    });
  });
});
