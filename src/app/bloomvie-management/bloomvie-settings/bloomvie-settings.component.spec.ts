import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, NgForm } from '@angular/forms';
import { of } from 'rxjs';
import { BloomvieSettingsComponent } from './bloomvie-settings.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../common-component/common.service';
import { CookieService } from 'ngx-cookie-service';

describe('BloomvieSettingsComponent', () => {
  let component: BloomvieSettingsComponent;
  let fixture: ComponentFixture<BloomvieSettingsComponent>;
  let spinnerSpy: jasmine.SpyObj<NgxSpinnerService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;
  let commonServiceSpy: jasmine.SpyObj<CommonService>;
  let cookieServiceSpy: jasmine.SpyObj<CookieService>;

  beforeEach(async () => {
    spinnerSpy = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'warning', 'error', 'info']);
    commonServiceSpy = jasmine.createSpyObj('CommonService', [
      'getBloomvieSettings',
      'manageBloomvieSettings',
      'manageBloomvieRadiusSettings'
    ]);
    cookieServiceSpy = jasmine.createSpyObj('CookieService', ['get', 'set', 'delete', 'check', 'deleteAll']);

    cookieServiceSpy.get.and.callFake((key: string) => {
      if (key === 'UserRoleId') return '1';
      if (key === 'UserId') return '42';
      return '';
    });

    commonServiceSpy.getBloomvieSettings.and.returnValue(
      of({
        message: 'Success',
        activity: 'Retrieved settings',
        result: {
          studentMediaDownload: 10,
          costPerGB: 5,
          radius: 25,
          email: 'test@bloomvie.com',
          platformFeePercentage: 15,
        },
      })
    );

    await TestBed.configureTestingModule({
      imports: [BloomvieSettingsComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: NgxSpinnerService, useValue: spinnerSpy },
        { provide: ToastrService, useValue: toastrSpy },
        { provide: CommonService, useValue: commonServiceSpy },
        { provide: CookieService, useValue: cookieServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(BloomvieSettingsComponent);
    component = fixture.componentInstance;
  });

  it('should create the component and initialize forms', () => {
    expect(component).toBeTruthy();
    expect(component.bloomviesettingsform).toBeDefined();
    expect(component.bloomvieradiussettingsform).toBeDefined();
    expect(component.bloomviesettingsform.controls['studentMediaDownload']).toBeDefined();
    expect(component.bloomvieradiussettingsform.controls['radius']).toBeDefined();
  });

  it('should initialize cookies and load settings on ngOnInit', () => {
    component.ngOnInit();

    expect(cookieServiceSpy.get).toHaveBeenCalledWith('UserRoleId');
    expect(cookieServiceSpy.get).toHaveBeenCalledWith('UserId');
    expect(component.userRoleID).toBe('1');
    expect(component.ownerID).toBe('42');
    expect(commonServiceSpy.getBloomvieSettings).toHaveBeenCalledWith(1);
    expect(component.bloomvieSettings).toBeDefined();
    expect(component.platformFee).toBe(15);
    expect(component.bloomviesettingsform.value.studentMediaDownload).toBe(10);
    expect(component.bloomvieradiussettingsform.value.radius).toBe(25);
    expect(spinnerSpy.hide).toHaveBeenCalled();
  });

  it('should handle getBloomvieSettings when response message is not Success', () => {
    commonServiceSpy.getBloomvieSettings.and.returnValue(
      of({ message: 'Error', activity: 'Failed', result: null })
    );

    component.getBloomvieSettings();

    expect(spinnerSpy.show).toHaveBeenCalled();
    expect(spinnerSpy.hide).toHaveBeenCalled();
    expect(component.bloomvieSettings).toBeNull();
  });

  it('should reset bloomviesettingsform to default values', () => {
    component.bloomviesettingsform.patchValue({
      studentMediaDownload: 99,
      costPerGB: 88,
    });
    component.reset();

    expect(component.bloomviesettingsform.value.studentMediaDownload).toBe('');
    expect(component.bloomviesettingsform.value.costPerGB).toBe('');
    expect(component.bloomviesettingsform.value.isActive).toBe(true);
  });

  describe('submitPlatFormFee', () => {
    it('should mark controls touched if form is invalid', () => {
      const mockForm = {
        valid: false,
        controls: {
          fee: { markAsTouched: jasmine.createSpy('markAsTouched') },
        },
      } as unknown as NgForm;

      component.submitPlatFormFee(mockForm);

      expect(mockForm.controls['fee'].markAsTouched).toHaveBeenCalled();
      expect(commonServiceSpy.manageBloomvieSettings).not.toHaveBeenCalled();
    });

    it('should submit successfully when form is valid and bloomvieSettings exists', () => {
      component.bloomvieSettings = {
        studentMediaDownload: 10,
        costPerGB: 5,
        platformFeePercentage: 15,
      };
      component.platformFee = 20;
      component.ownerID = '42';
      component.userRoleID = '1';

      commonServiceSpy.manageBloomvieSettings.and.returnValue(
        of({ message: 'OK', activity: 'Updated successfully', result: null })
      );

      const mockForm = {
        valid: true,
        controls: {},
      } as unknown as NgForm;

      component.submitPlatFormFee(mockForm);

      expect(spinnerSpy.show).toHaveBeenCalled();
      expect(commonServiceSpy.manageBloomvieSettings).toHaveBeenCalledWith(
        jasmine.objectContaining({
          platFormFee: 20,
          ownerID: 42,
          userRoleID: 1,
        })
      );
      expect(toastrSpy.success).toHaveBeenCalledWith('Updated successfully');
      expect(spinnerSpy.hide).toHaveBeenCalled();
    });

    it('should use form values if bloomvieSettings is null and show warning on non-OK response', () => {
      component.bloomvieSettings = null;
      component.bloomviesettingsform.patchValue({
        id: 1,
        studentMediaDownload: 5,
        costPerGB: 2,
        ownerID: 0,
        userRoleID: 0,
        isActive: true,
      });
      component.platformFee = 10;
      component.ownerID = '10';
      component.userRoleID = '2';

      commonServiceSpy.manageBloomvieSettings.and.returnValue(
        of({ message: 'Fail', activity: 'Failed to update', result: null })
      );

      const mockForm = {
        valid: true,
        controls: {},
      } as unknown as NgForm;

      component.submitPlatFormFee(mockForm);

      expect(toastrSpy.warning).toHaveBeenCalledWith('Failed to update');
    });
  });

  describe('manageAreaOfExpertise', () => {
    it('should mark all controls as touched if bloomviesettingsform is invalid', () => {
      component.bloomviesettingsform.patchValue({
        studentMediaDownload: '',
        costPerGB: '',
      });

      component.manageAreaOfExpertise();

      expect(component.bloomviesettingsform.invalid).toBe(true);
      expect(commonServiceSpy.manageBloomvieSettings).not.toHaveBeenCalled();
    });

    it('should save settings successfully when bloomviesettingsform is valid', () => {
      component.bloomvieSettings = { platformFeePercentage: 12 };
      component.ownerID = '15';
      component.userRoleID = '3';
      component.bloomviesettingsform.patchValue({
        id: 1,
        studentMediaDownload: 10,
        costPerGB: 4,
        isActive: true,
      });

      commonServiceSpy.manageBloomvieSettings.and.returnValue(
        of({ message: 'OK', activity: 'Settings saved', result: null })
      );

      component.manageAreaOfExpertise();

      expect(spinnerSpy.show).toHaveBeenCalled();
      expect(commonServiceSpy.manageBloomvieSettings).toHaveBeenCalledWith(
        jasmine.objectContaining({
          platFormFee: 12,
          ownerID: 15,
          userRoleID: 3,
        })
      );
      expect(toastrSpy.success).toHaveBeenCalledWith('Settings saved');
      expect(spinnerSpy.hide).toHaveBeenCalled();
    });

    it('should show warning on non-OK response when saving area of expertise', () => {
      component.bloomvieSettings = {};
      component.ownerID = '1';
      component.userRoleID = '1';
      component.bloomviesettingsform.patchValue({
        studentMediaDownload: 20,
        costPerGB: 10,
      });

      commonServiceSpy.manageBloomvieSettings.and.returnValue(
        of({ message: 'Bad', activity: 'Could not save', result: null })
      );

      component.manageAreaOfExpertise();

      expect(toastrSpy.warning).toHaveBeenCalledWith('Could not save');
      expect(spinnerSpy.hide).toHaveBeenCalled();
    });
  });

  describe('manageBloomvieRadiusSettings', () => {
    it('should mark all controls as touched when radius form is invalid', () => {
      component.bloomvieradiussettingsform.patchValue({
        radius: '',
      });

      component.manageBloomvieRadiusSettings();

      expect(component.bloomvieradiussettingsform.invalid).toBe(true);
      expect(commonServiceSpy.manageBloomvieRadiusSettings).not.toHaveBeenCalled();
    });

    it('should save radius settings when form is valid and handle OK response', () => {
      component.ownerID = '5';
      component.userRoleID = '1';
      component.bloomvieradiussettingsform.patchValue({
        radius: 30,
        email: 'radius@test.com',
      });

      commonServiceSpy.manageBloomvieRadiusSettings.and.returnValue(
        of({ message: 'OK', activity: 'Radius updated', result: null })
      );

      component.manageBloomvieRadiusSettings();

      expect(spinnerSpy.show).toHaveBeenCalled();
      expect(commonServiceSpy.manageBloomvieRadiusSettings).toHaveBeenCalledWith(
        jasmine.objectContaining({
          radius: 30,
          email: 'radius@test.com',
          ownerID: 5,
          userRoleID: 1,
        })
      );
      expect(toastrSpy.success).toHaveBeenCalledWith('Radius updated');
      expect(spinnerSpy.hide).toHaveBeenCalled();
    });

    it('should handle non-OK response when saving radius settings', () => {
      component.ownerID = '5';
      component.userRoleID = '1';
      component.bloomvieradiussettingsform.patchValue({
        radius: 30,
      });

      commonServiceSpy.manageBloomvieRadiusSettings.and.returnValue(
        of({ message: 'Failed', activity: 'Radius update failed', result: null })
      );

      component.manageBloomvieRadiusSettings();

      expect(toastrSpy.warning).toHaveBeenCalledWith('Radius update failed');
      expect(spinnerSpy.hide).toHaveBeenCalled();
    });
  });
});
