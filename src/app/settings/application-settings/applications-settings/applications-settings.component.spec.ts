import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ApplicationsSettingsComponent } from './applications-settings.component';
import { ApplicationsSettingsService } from './applications-settings.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppService } from '../../../app.service';
import { Title } from '@angular/platform-browser';
import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

describe('ApplicationsSettingsComponent', () => {
  let component: ApplicationsSettingsComponent;
  let fixture: ComponentFixture<ApplicationsSettingsComponent>;
  let mockAppServiceSettings: jasmine.SpyObj<ApplicationsSettingsService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockAppService: jasmine.SpyObj<AppService>;
  let mockTitle: jasmine.SpyObj<Title>;
  let mockCookie: jasmine.SpyObj<CookieService>;
  let mockCdr: jasmine.SpyObj<ChangeDetectorRef>;

  beforeEach(async () => {
    mockAppServiceSettings = jasmine.createSpyObj('ApplicationsSettingsService', [
      'GetApplicationSetting',
      'ManageApplicationSettings',
      'uploadImages',
      'setImage',
    ]);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockAppService = jasmine.createSpyObj('AppService', ['changeFavicon']);
    mockTitle = jasmine.createSpyObj('Title', ['setTitle']);
    mockCookie = jasmine.createSpyObj('CookieService', ['get', 'set', 'check', 'delete']);
    mockCdr = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges', 'markForCheck']);

    mockAppServiceSettings.GetApplicationSetting.and.returnValue(
      of({
        message: 'Success',
        result: {
          id: 1,
          mainLogo: 'main.png',
          footerLogo: 'footer.png',
          businessName: 'Bloomvie Daycare',
          description: 'A great daycare',
          breadcrumbText: 'Welcome',
          footerText: 'All rights reserved',
          copyRightText: 'Copyright 2026',
          favicon: 'fav.ico',
        },
      })
    );

    await TestBed.configureTestingModule({
      imports: [ApplicationsSettingsComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: ApplicationsSettingsService, useValue: mockAppServiceSettings },
        { provide: ToastrService, useValue: mockToastr },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: AppService, useValue: mockAppService },
        { provide: Title, useValue: mockTitle },
        { provide: CookieService, useValue: mockCookie },
        { provide: ChangeDetectorRef, useValue: mockCdr },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ApplicationsSettingsComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ApplicationsSettingsComponent);
    component = fixture.componentInstance;
  });

  it('should create the component and initialize the form with default values', () => {
    expect(component).toBeTruthy();
    expect(component.appSetting).toBeDefined();
    expect(component.appSetting.get('id')?.value).toBe(0);
    expect(component.input).toBe(component.appSetting.controls);
  });

  describe('ngOnInit', () => {
    it('should call getApplicationSetting and populate form and image urls on Success', () => {
      component.ngOnInit();

      expect(mockAppServiceSettings.GetApplicationSetting).toHaveBeenCalled();
      expect(component.Data.businessName).toBe('Bloomvie Daycare');
      expect(component.appSetting.value.businessName).toBe('Bloomvie Daycare');
      expect(component.imageMain).toContain('Content/Image/mainLogo/main.png');
      expect(component.imagefoot).toContain('Content/Image/footerLogo/footer.png');
      expect(component.imagefav).toContain('Content/Image/favicon/fav.ico');
    });

    it('should not update form if getApplicationSetting returns non-Success', () => {
      mockAppServiceSettings.GetApplicationSetting.and.returnValue(
        of({ message: 'Error', result: null })
      );

      component.appSetting.patchValue({ businessName: 'Initial Name' });
      component.getApplicationSetting();

      expect(component.appSetting.value.businessName).toBe('Initial Name');
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      (window as any).$ = jasmine.createSpy('$').and.returnValue({
        text: jasmine.createSpy('text'),
        val: jasmine.createSpy('val'),
      });
    });

    it('should mark all controls as touched if form is invalid', async () => {
      spyOn(component.appSetting, 'markAllAsTouched');
      component.appSetting.patchValue({ businessName: '' });

      await component.onSubmit('submit');

      expect(component.appSetting.markAllAsTouched).toHaveBeenCalled();
      expect(mockSpinner.show).not.toHaveBeenCalled();
    });

    it('should upload images, save settings and show success when id == 0', async () => {
      component.appSetting.patchValue({
        id: 0,
        mainLogo: 'main.png',
        footerLogo: 'foot.png',
        businessName: 'My Care',
        description: 'Desc',
        breadcrumbText: 'Breadcrumb',
        footerText: 'Foot text',
        copyRightText: 'Copy text',
        favicon: 'fav.ico',
      });

      mockAppServiceSettings.uploadImages.and.returnValue(
        of({
          message: 'OK',
          result: [
            { type: 'mainLogo', imageName: 'new-main.png' },
            { type: 'footerLogo', imageName: 'new-foot.png' },
            { type: 'favicon', imageName: 'new-fav.ico' },
          ],
        })
      );

      mockAppServiceSettings.ManageApplicationSettings.and.returnValue(
        of({
          message: 'Success',
          result: { businessName: 'My Care', id: 0 },
        })
      );

      await component.onSubmit('submit');

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(mockAppServiceSettings.uploadImages).toHaveBeenCalled();
      expect(mockAppServiceSettings.ManageApplicationSettings).toHaveBeenCalled();
      expect(mockCookie.set).toHaveBeenCalledWith('CentreName', 'My Care');
      expect(mockToastr.success).toHaveBeenCalledWith('Data saved successfully!');
      expect(mockSpinner.hide).toHaveBeenCalled();
    });

    it('should show update success message and reset formsData when id > 0', async () => {
      component.appSetting.patchValue({
        id: 10,
        mainLogo: 'main.png',
        footerLogo: 'foot.png',
        businessName: 'Updated Care',
        description: 'Desc',
        breadcrumbText: 'Breadcrumb',
        footerText: 'Foot text',
        copyRightText: 'Copy text',
        favicon: 'fav.ico',
      });

      mockAppServiceSettings.uploadImages.and.returnValue(
        of({
          message: 'OK',
          result: [],
        })
      );

      mockAppServiceSettings.ManageApplicationSettings.and.returnValue(
        of({
          message: 'Success',
          result: { businessName: 'Updated Care', id: 10 },
        })
      );

      await component.onSubmit('submit');

      expect(mockToastr.success).toHaveBeenCalledWith('Data updated successfully!');
      expect(mockSpinner.hide).toHaveBeenCalled();
    });

    it('should catch and log error if uploadImages or ManageApplicationSettings throws', async () => {
      component.appSetting.patchValue({
        id: 1,
        mainLogo: 'main.png',
        footerLogo: 'foot.png',
        businessName: 'Care',
        description: 'Desc',
        breadcrumbText: 'Breadcrumb',
        footerText: 'Foot text',
        copyRightText: 'Copy text',
        favicon: 'fav.ico',
      });

      spyOn(console, 'error');
      mockAppServiceSettings.uploadImages.and.returnValue(throwError(() => new Error('Upload failed')));

      await component.onSubmit('submit');

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('fileChange', () => {
    it('should clear validators for mainLogo and read file', () => {
      const file = new File(['dummy'], 'logo.png', { type: 'image/png' });
      const event = { target: { files: [file] } };

      component.fileChange(event, 'mainLogo');

      expect(component.appSetting.get('mainLogo')?.validator).toBeNull();
    });

    it('should clear validators for footerLogo and read file', () => {
      const file = new File(['dummy'], 'footer.png', { type: 'image/png' });
      const event = { target: { files: [file] } };

      component.fileChange(event, 'footerLogo');

      expect(component.appSetting.get('footerLogo')?.validator).toBeNull();
    });

    it('should clear validators for favicon and read file', () => {
      const file = new File(['dummy'], 'fav.ico', { type: 'image/x-icon' });
      const event = { target: { files: [file] } };

      component.fileChange(event, 'favicon');

      expect(component.appSetting.get('favicon')?.validator).toBeNull();
    });

    it('should return early when no files are selected', () => {
      const event = { target: { files: [] } };
      expect(component.fileChange(event, 'mainLogo')).toBeUndefined();
    });
  });

  describe('reset', () => {
    it('should reset appSetting form and clear image references', () => {
      component.imageMain = 'http://example.com/main.png';
      component.imagefoot = 'http://example.com/foot.png';
      component.imagefav = 'http://example.com/fav.ico';

      component.reset();

      expect(component.appSetting.value.businessName).toBe('');
      expect(component.appSetting.value.id).toBe(0);
      expect(component.imageMain).toBeNull();
      expect(component.imagefoot).toBeNull();
      expect(component.imagefav).toBeNull();
    });
  });

  describe('pincodeCheck', () => {
    it('should trigger warning if pincode length is not 6', () => {
      spyOn(Swal, 'fire');
      (window as any).$ = jasmine.createSpy('$').and.returnValue({
        val: jasmine.createSpy('val').and.returnValue('123'),
      });

      component.pincodeCheck();

      expect(Swal.fire).toHaveBeenCalledWith(
        jasmine.objectContaining({
          icon: 'warning',
          text: 'Pincode must be 6 digits long.',
        })
      );
    });
  });
});
