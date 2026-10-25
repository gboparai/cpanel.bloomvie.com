import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SmtpListComponent } from './smtp-list.component';
import { SmtpService } from '../smtp.service';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import Swal from 'sweetalert2';

describe('SmtpListComponent', () => {
  let component: SmtpListComponent;
  let fixture: ComponentFixture<SmtpListComponent>;
  let mockSmtpService: jasmine.SpyObj<SmtpService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockCookie: jasmine.SpyObj<CookieService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;

  beforeEach(async () => {
    mockSmtpService = jasmine.createSpyObj('SmtpService', [
      'GetAllSMTPSettings',
      'ActiveInactiveSMTPSettingbyId',
    ]);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning']);
    mockCookie = jasmine.createSpyObj('CookieService', ['get']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);

    mockCookie.get.and.returnValue('12');

    mockSmtpService.GetAllSMTPSettings.and.returnValue(
      of({
        message: 'Success',
        result: [
          { id: 1, host: 'smtp.gmail.com', port: '587', isActive: true },
          { id: 2, host: 'smtp.office365.com', port: '587', isActive: false },
        ],
      })
    );

    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      prop: jasmine.createSpy('prop'),
    });

    await TestBed.configureTestingModule({
      imports: [SmtpListComponent],
      providers: [
        { provide: SmtpService, useValue: mockSmtpService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: CookieService, useValue: mockCookie },
        { provide: NgxSpinnerService, useValue: mockSpinner },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(SmtpListComponent, {
        set: {
          imports: [],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(SmtpListComponent);
    component = fixture.componentInstance;
  });

  it('should create and initialize defaults', () => {
    expect(component).toBeTruthy();
    expect(component.ContentP).toBe(1);
    expect(component.Contentsize).toBe(5);
    expect(component.isActive).toBeTrue();
  });

  describe('ngOnInit & GetList', () => {
    it('should read centreID and fetch smtp settings on Success', () => {
      component.ngOnInit();

      expect(mockCookie.get).toHaveBeenCalledWith('CentreID');
      expect(mockSmtpService.GetAllSMTPSettings).toHaveBeenCalledWith(12);
      expect(component.smtpList.length).toBe(2);
      expect(component.skeletonShow).toBe('');
    });

    it('should default centreID to 0 if cookie is empty or not a number', () => {
      mockCookie.get.and.returnValue('');

      component.GetList();

      expect(mockSmtpService.GetAllSMTPSettings).toHaveBeenCalledWith(0);
    });

    it('should handle non-Success message in GetList gracefully', () => {
      spyOn(console, 'warn');
      mockSmtpService.GetAllSMTPSettings.and.returnValue(
        of({ message: 'Error', result: [] })
      );

      component.GetList();

      expect(console.warn).toHaveBeenCalledWith('NO Data Found!');
      expect(component.skeletonShow).toBe('');
    });
  });

  describe('onEdit', () => {
    it('should emit idSelected event with given id', () => {
      spyOn(component.idSelected, 'emit');

      component.onEdit('15');

      expect(component.idSelected.emit).toHaveBeenCalledWith('15');
    });
  });

  describe('activeInactive', () => {
    it('should deactivate SMTP when confirmed and isActive was true', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      mockSmtpService.ActiveInactiveSMTPSettingbyId.and.returnValue(of({ message: 'Success' }));
      spyOn(component, 'GetList');

      component.activeInactive(1, true);
      tick();

      expect(mockSmtpService.ActiveInactiveSMTPSettingbyId).toHaveBeenCalledWith(1);
      expect(mockToastr.success).toHaveBeenCalledWith('SMTP has been deactivated successfully');
      expect(component.GetList).toHaveBeenCalled();
    }));

    it('should activate SMTP when confirmed and isActive was false', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      mockSmtpService.ActiveInactiveSMTPSettingbyId.and.returnValue(of({ message: 'Success' }));
      spyOn(component, 'GetList');

      component.activeInactive(2, false);
      tick();

      expect(mockSmtpService.ActiveInactiveSMTPSettingbyId).toHaveBeenCalledWith(2);
      expect(mockToastr.success).toHaveBeenCalledWith('SMTP has been activated successfully');
    }));

    it('should revert checkbox if user cancels confirmation', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: false } as any));

      component.activeInactive(1, true);
      tick();

      expect(mockSmtpService.ActiveInactiveSMTPSettingbyId).not.toHaveBeenCalled();
    }));
  });
});
