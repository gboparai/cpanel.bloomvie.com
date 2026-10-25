import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SmtpComponent } from './smtp.component';
import { SmtpService } from './smtp.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { CookieService } from 'ngx-cookie-service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

describe('SmtpComponent', () => {
  let component: SmtpComponent;
  let fixture: ComponentFixture<SmtpComponent>;
  let mockSmtpService: jasmine.SpyObj<SmtpService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockCookie: jasmine.SpyObj<CookieService>;

  beforeEach(async () => {
    mockSmtpService = jasmine.createSpyObj('SmtpService', [
      'GetSMTPSettingbyId',
      'ManageSMTP',
    ]);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockCookie = jasmine.createSpyObj('CookieService', ['get']);

    mockCookie.get.and.callFake((key: string) => {
      if (key === 'CentreID') return '10';
      if (key === 'UserId') return '5';
      return '';
    });

    await TestBed.configureTestingModule({
      imports: [SmtpComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: SmtpService, useValue: mockSmtpService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: CookieService, useValue: mockCookie },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(SmtpComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(SmtpComponent);
    component = fixture.componentInstance;
    component.SmtpListComponent = {
      GetList: jasmine.createSpy('GetList'),
    } as any;
  });

  it('should create and initialize default form values', () => {
    expect(component).toBeTruthy();
    expect(component.smtpform).toBeDefined();
    expect(component.smtpform.get('id')?.value).toBe(0);
    expect(component.input).toBe(component.smtpform.controls);
  });

  describe('ngOnInit', () => {
    it('should read cookies and call child SmtpListComponent.GetList()', () => {
      component.ngOnInit();

      expect(component.centreID).toBe(10);
      expect(component.userID).toBe(5);
      expect(component.SmtpListComponent.GetList).toHaveBeenCalled();
    });
  });

  describe('handleIdSelected', () => {
    it('should show error if selectedId is empty', () => {
      component.handleIdSelected('');

      expect(mockToastr.error).toHaveBeenCalledWith('Invalid ID selected.');
      expect(mockSpinner.hide).toHaveBeenCalled();
    });

    it('should fetch SMTP setting by ID, patch form, and scroll to top on Success', () => {
      spyOn(window, 'scrollTo');
      mockSmtpService.GetSMTPSettingbyId.and.returnValue(
        of({
          message: 'Success',
          result: {
            id: 25,
            username: 'mail@bloomvie.com',
            password: 'secretPassword',
            host: 'smtp.mailtrap.io',
            port: '2525',
            ssl: true,
            enableConsole: false,
            isActive: true,
            fromEmailID: 'noreply@bloomvie.com',
          },
        })
      );

      component.handleIdSelected('25');

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(mockSmtpService.GetSMTPSettingbyId).toHaveBeenCalledWith('25');
      expect(component.smtpform.value.username).toBe('mail@bloomvie.com');
      expect(component.smtpform.value.fromEmail).toBe('noreply@bloomvie.com');
      expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
      expect(mockSpinner.hide).toHaveBeenCalled();
    });

    it('should show error toastr when GetSMTPSettingbyId returns failure', () => {
      mockSmtpService.GetSMTPSettingbyId.and.returnValue(
        of({ message: 'Error', result: null })
      );

      component.handleIdSelected('25');

      expect(mockToastr.error).toHaveBeenCalledWith('Error patching values');
      expect(mockSpinner.hide).toHaveBeenCalled();
    });
  });

  describe('onSubmit', () => {
    it('should mark all controls touched when form is invalid', () => {
      spyOn(component.smtpform, 'markAllAsTouched');
      component.smtpform.patchValue({ username: '' });

      component.onSubmit();

      expect(component.smtpform.markAllAsTouched).toHaveBeenCalled();
    });

    it('should save SMTP settings successfully when id is 0', fakeAsync(() => {
      component.smtpform.patchValue({
        id: 0,
        username: 'admin@bloomvie.com',
        password: 'pass',
        host: 'smtp.gmail.com',
        port: '587',
        fromEmail: 'admin@bloomvie.com',
      });

      mockSmtpService.ManageSMTP.and.returnValue(
        of({ message: 'Success' })
      );

      component.onSubmit();

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(mockSmtpService.ManageSMTP).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('SMTP saved successfully.');

      tick(1000);

      expect(mockSpinner.hide).toHaveBeenCalled();
      expect(component.SmtpListComponent.GetList).toHaveBeenCalled();
    }));

    it('should update SMTP settings successfully when id > 0', fakeAsync(() => {
      component.smtpform.patchValue({
        id: 10,
        username: 'admin@bloomvie.com',
        password: 'pass',
        host: 'smtp.gmail.com',
        port: '587',
        fromEmail: 'admin@bloomvie.com',
      });

      mockSmtpService.ManageSMTP.and.returnValue(
        of({ message: 'Success' })
      );

      component.onSubmit();

      expect(mockToastr.success).toHaveBeenCalledWith('SMTP updated successfully.');

      tick(1000);
      expect(mockSpinner.hide).toHaveBeenCalled();
    }));
  });

  describe('reset', () => {
    it('should reset form controls to defaults', () => {
      component.smtpform.patchValue({ username: 'test@example.com', host: 'smtp.test.com' });
      component.reset();

      expect(component.smtpform.value.id).toBe(0);
      expect(component.smtpform.value.username).toBe('');
      expect(component.smtpform.value.host).toBe('');
    });
  });
});
