import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ContentManagementComponent } from './content-management.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { ContentManagementService } from './content-management.service';
import { ApplicationsSettingsService } from '../settings/application-settings/applications-settings/applications-settings.service';
import { CookieService } from 'ngx-cookie-service';
import { CommonService } from '../common-component/common.service';
import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, Subject } from 'rxjs';
import Swal from 'sweetalert2';

describe('ContentManagementComponent', () => {
  let component: ContentManagementComponent;
  let fixture: ComponentFixture<ContentManagementComponent>;
  let mockContentService: jasmine.SpyObj<ContentManagementService>;
  let mockAppSettingsService: jasmine.SpyObj<ApplicationsSettingsService>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockRouter: any;

  beforeEach(async () => {
    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      prop: jasmine.createSpy('prop'),
      val: jasmine.createSpy('val').and.returnValue(''),
    });
    spyOn(window, 'scrollTo').and.callFake(() => {});

    mockContentService = jasmine.createSpyObj('ContentManagementService', [
      'ActiveInactiveContent',
      'manageContent',
      'getFrontentContentByType',
      'getDayCareGallery',
      'dayCareCentreContentMaster',
      'GetSectionListBySectionAndTypeName',
      'getDayCareCentreContentMaster',
      'DaycareGalleryDelete',
      'GetHomePageSection',
    ]);
    mockAppSettingsService = jasmine.createSpyObj('ApplicationsSettingsService', ['uploadImages']);
    mockCookieService = jasmine.createSpyObj('CookieService', ['get']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'info', 'warning']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['convertS3File']);
    mockCommonService.convertS3File.and.callFake((val: string) => `https://s3.aws.com/${val}`);

    mockRouter = {
      events: new Subject<any>(),
      navigate: jasmine.createSpy('navigate'),
    };

    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'UserId') return '123';
      if (key === 'UserInfo') {
        return JSON.stringify({
          result: { userRoleID: 1, centreID: 5 },
        });
      }
      return '';
    });

    mockContentService.GetHomePageSection.and.returnValue(
      of({ message: 'OK', result: [{ section: 'Section 1' }] })
    );
    mockContentService.GetSectionListBySectionAndTypeName.and.returnValue(
      of({ message: 'OK', result: [] })
    );

    await TestBed.configureTestingModule({
      imports: [ContentManagementComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        ChangeDetectorRef,
        { provide: ContentManagementService, useValue: mockContentService },
        { provide: ApplicationsSettingsService, useValue: mockAppSettingsService },
        { provide: CookieService, useValue: mockCookieService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: CommonService, useValue: mockCommonService },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: { get: () => 'About Us' },
            },
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ContentManagementComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ContentManagementComponent);
    component = fixture.componentInstance;
  });

  it('should create the ContentManagementComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize form controls and validators', () => {
      expect(component.form.contains('ID')).toBeTrue();
      expect(component.form.contains('Title1')).toBeTrue();
      expect(component.form.contains('Description')).toBeTrue();
      expect(component.form.contains('Section')).toBeTrue();
    });
  });

  describe('ngOnInit', () => {
    it('should populate credentials and handle query params', () => {
      component.ngOnInit();

      expect(component.loginUserId).toBe('123');
      expect(component.UserRoleId).toBe(1);
      expect(component.DayCareCentreID).toBe(5);
      expect(component.menuType).toBe('About Us');
      expect(mockContentService.GetHomePageSection).toHaveBeenCalledWith('About Us', '123' as any);
    });
  });

  describe('Editing & Reset', () => {
    it('should populate form on onEdit', () => {
      const footerItem = {
        id: 10,
        title1: 'Header 1',
        title2: 'Header 2',
        title3: 'Header 3',
        section: 'Section 1',
        description: '<p>Content</p>',
        image: 'uploads/img1.jpg,uploads/img2.jpg',
        s3Urls: ['url1', 'url2'],
      };

      component.onEdit(footerItem);

      expect(component.form.value.ID).toBe(10);
      expect(component.form.value.Title1).toBe('Header 1');
      expect(component.submitButtonText).toBe('Update');
      expect(component.imagePreviews.length).toBe(2);
    });

    it('should reset form on CancelClick', () => {
      component.form.patchValue({ Title1: 'Temp' });
      component.submitButtonText = 'Update';

      component.CancelClick();

      expect(component.submitButtonText).toBe('Submit');
      expect(component.fileNamesDisplay).toBe('');
    });
  });

  describe('Active/Inactive Toggle', () => {
    it('should toggle active status after Swal confirmation', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      mockContentService.ActiveInactiveContent.and.returnValue(of({ message: 'Success' }));
      const event = { target: { checked: true } };

      component.ActiveInactive(10, false, event, {});
      tick();

      expect(mockContentService.ActiveInactiveContent).toHaveBeenCalledWith(10, {});
      expect(mockToastr.success).toHaveBeenCalledWith('Menu Activated successfully');
    }));
  });

  describe('DeleteImage', () => {
    it('should remove image preview and update form Image control', () => {
      component.imagePreviews = [
        { s3Url: 'url1', imagePath: 'path1.jpg' },
        { s3Url: 'url2', imagePath: 'path2.jpg' },
      ];
      component.CMSImageinput = { nativeElement: { value: 'file' } } as any;

      component.DeleteImage(0);

      expect(component.imagePreviews.length).toBe(1);
      expect(component.form.value.Image).toBe('path2.jpg');
      expect(mockToastr.success).toHaveBeenCalledWith('Image deleted successfully.');
    });
  });

  describe('onSubmit', () => {
    it('should upload images and manage content successfully', async () => {
      component.form.patchValue({
        Section: 'Section 1',
        Description: 'Sample Description',
      });
      component.menuType = 'About Us';
      mockAppSettingsService.uploadImages.and.returnValue(of({ result: [{ path: 'p', imageName: 'img.jpg' }] }));
      mockContentService.manageContent.and.returnValue(of({ message: 'OK', activity: 'Saved' }));
      spyOn(component, 'getHomePageSection');

      await component.onSubmit();

      expect(mockContentService.manageContent).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('', 'Saved');
      expect(component.getHomePageSection).toHaveBeenCalled();
    });

    it('should mark all controls touched and stop if form is invalid', async () => {
      component.form.patchValue({ Description: '' });
      await component.onSubmit();
      expect(mockContentService.manageContent).not.toHaveBeenCalled();
      expect(component.form.touched).toBeTrue();
    });
  });

  describe('Pagination & Filters', () => {
    it('should change page with onPageChange', () => {
      component.onPageChange(3);
      expect(component.ContentP).toBe(3);
    });

    it('should filter by active/inactive status', () => {
      spyOn(component, 'getHomePageSection');
      component.Filter(false, 'ACTIVE-INACTIVE');
      expect(component.Active).toBeFalse();
      expect(component.getHomePageSection).toHaveBeenCalled();
    });
  });
});
