import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { ParentMediaRequestComponent } from './parent-media-request.component';
import { BookKeepingService } from '../../common-component/book-keeping/book-keeping.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApplicationServiceService } from '../../application-status/application-service.service';
import { CookieService } from 'ngx-cookie-service';
import { ClassroomDetailsService } from '../../day-care-management/classroom-management/classroom-details/classroom-details.service';
import { DcAppointmentsListService } from '../dc-appointments-list/dc-appointments-list.service';
import { CommonService } from '../../common-component/common.service';

describe('ParentMediaRequestComponent', () => {
  let component: ParentMediaRequestComponent;
  let fixture: ComponentFixture<ParentMediaRequestComponent>;

  let bookKeepingServiceSpy: jasmine.SpyObj<BookKeepingService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;
  let spinnerSpy: jasmine.SpyObj<NgxSpinnerService>;
  let applicationServiceSpy: jasmine.SpyObj<ApplicationServiceService>;
  let cookieServiceSpy: jasmine.SpyObj<CookieService>;
  let classroomDetailsServiceSpy: jasmine.SpyObj<ClassroomDetailsService>;
  let dcAppointmentsListServiceSpy: jasmine.SpyObj<DcAppointmentsListService>;
  let commonServiceSpy: jasmine.SpyObj<CommonService>;
  let modalSpy: jasmine.Spy;

  beforeEach(async () => {
    bookKeepingServiceSpy = jasmine.createSpyObj('BookKeepingService', ['getAllInvoices']);
    toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);
    spinnerSpy = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    applicationServiceSpy = jasmine.createSpyObj('ApplicationServiceService', [
      'getAllStudentMediaPlans',
    ]);
    cookieServiceSpy = jasmine.createSpyObj('CookieService', ['get']);
    classroomDetailsServiceSpy = jasmine.createSpyObj('ClassroomDetailsService', [
      'getStudentMediaRequest',
    ]);
    dcAppointmentsListServiceSpy = jasmine.createSpyObj('DcAppointmentsListService', [
      'SendEmailAfterMeeting',
    ]);
    commonServiceSpy = jasmine.createSpyObj('CommonService', [
      'encrypt',
      'sendEmailStudentMediaRequest',
    ]);

    commonServiceSpy.encrypt.and.callFake((val: string) => `enc_${val}`);
    cookieServiceSpy.get.and.callFake((key: string) => {
      if (key === 'UserRoleId') return '1';
      if (key === 'UserId') return '45';
      return '';
    });

    modalSpy = jasmine.createSpy('modal');
    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: modalSpy,
    });

    applicationServiceSpy.getAllStudentMediaPlans.and.returnValue(
      of({ message: 'OK', result: [{ id: 1, name: 'Basic Plan' }] })
    );
    classroomDetailsServiceSpy.getStudentMediaRequest.and.returnValue(
      of({ message: 'OK', result: [{ id: 10, parentID: 5, centreID: 2 }] })
    );

    await TestBed.configureTestingModule({
      imports: [ParentMediaRequestComponent, ReactiveFormsModule],
      providers: [
        DatePipe,
        FormBuilder,
        { provide: BookKeepingService, useValue: bookKeepingServiceSpy },
        { provide: ToastrService, useValue: toastrSpy },
        { provide: NgxSpinnerService, useValue: spinnerSpy },
        { provide: ApplicationServiceService, useValue: applicationServiceSpy },
        { provide: CookieService, useValue: cookieServiceSpy },
        { provide: ClassroomDetailsService, useValue: classroomDetailsServiceSpy },
        { provide: DcAppointmentsListService, useValue: dcAppointmentsListServiceSpy },
        { provide: CommonService, useValue: commonServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ParentMediaRequestComponent);
    component = fixture.componentInstance;
  });

  it('should create the component and initialize planForm', () => {
    expect(component).toBeTruthy();
    expect(component.planForm).toBeDefined();
    expect(component.planForm.controls['plan']).toBeDefined();
  });

  describe('ngOnInit', () => {
    it('should read cookies and fetch media requests and plans', () => {
      component.ngOnInit();

      expect(cookieServiceSpy.get).toHaveBeenCalledWith('UserRoleId');
      expect(cookieServiceSpy.get).toHaveBeenCalledWith('UserId');
      expect(component.userRoleId).toBe(1);
      expect(component.userID).toBe(45);
      expect(classroomDetailsServiceSpy.getStudentMediaRequest).toHaveBeenCalledWith(1);
      expect(applicationServiceSpy.getAllStudentMediaPlans).toHaveBeenCalledWith(1);
      expect(component.StudentMediaRequest).toEqual([{ id: 10, parentID: 5, centreID: 2 }]);
      expect(component.getPlansList).toEqual([{ id: 1, name: 'Basic Plan' }]);
    });
  });

  describe('Modal and date helpers', () => {
    it('should open modal and calculate formatted dates and duration', () => {
      const data = {
        parentID: 7,
        centreID: 3,
        startDate: '2026-10-01T00:00:00',
        endDate: '2026-10-06T00:00:00',
        fileSize: '500MB',
      };

      component.openModal(data);

      expect(component.parentID).toBe(7);
      expect(component.centreID).toBe(3);
      expect(component.selectedStartDate).toBe('2026-10-01T00:00:00');
      expect(component.selectedEndDate).toBe('2026-10-06T00:00:00');
      expect(component.selectedFileSize).toBe('500MB');
      expect(component.duration).toBe(5);
    });

    it('should calculate days difference correctly', () => {
      const days = component.calculateDays('2026-10-01', '2026-10-10');
      expect(days).toBe(9);
    });

    it('should set onSelectPlan when onPlanSelect is called', () => {
      component.onPlanSelect({ id: 99 });
      expect(component.onSelectPlan).toBe(99);
    });

    it('should reset data', () => {
      component.planInformation = { plan: 'Gold' };
      component.resetData();
      expect(component.planInformation).toBeNull();
    });

    it('should submit plan and reset if planInformation exists', () => {
      component.planInformation = { plan: 'Gold' };
      spyOn(component, 'resetData').and.callThrough();

      component.submitPlan();

      expect(component.resetData).toHaveBeenCalled();
      expect(component.planInformation).toBeNull();
    });
  });

  describe('sendEmailStudentMediaRequest', () => {
    it('should send email and handle success response', () => {
      component.parentID = 12;
      component.onSelectPlan = '34';

      commonServiceSpy.sendEmailStudentMediaRequest.and.returnValue(
        of({ message: 'Success' })
      );

      component.sendEmailStudentMediaRequest();

      expect(commonServiceSpy.encrypt).toHaveBeenCalledWith('12');
      expect(commonServiceSpy.encrypt).toHaveBeenCalledWith('34');
      expect(commonServiceSpy.encrypt).toHaveBeenCalledWith('studentMediaRequest');
      expect(commonServiceSpy.sendEmailStudentMediaRequest).toHaveBeenCalledWith(
        12,
        '34',
        'enc_34',
        'enc_12',
        'enc_studentMediaRequest'
      );
      expect(toastrSpy.success).toHaveBeenCalledWith('Email Sent Successfully');
      expect(modalSpy).toHaveBeenCalledWith('hide');
      expect(spinnerSpy.hide).toHaveBeenCalled();
    });

    it('should handle failure in sendEmailStudentMediaRequest', () => {
      component.parentID = 12;
      component.onSelectPlan = '34';

      commonServiceSpy.sendEmailStudentMediaRequest.and.returnValue(
        of({ message: 'Failed' })
      );

      component.sendEmailStudentMediaRequest();

      expect(toastrSpy.error).toHaveBeenCalledWith('Something wents wrong !!');
      expect(spinnerSpy.hide).toHaveBeenCalled();
    });
  });
});
