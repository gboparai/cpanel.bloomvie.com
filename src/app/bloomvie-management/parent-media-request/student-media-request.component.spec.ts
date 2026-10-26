import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, ChangeDetectorRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { StudentMediaRequestComponent } from './student-media-request.component';
import { BookKeepingService } from '../../common-component/book-keeping/book-keeping.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApplicationServiceService } from '../../application-status/application-service.service';
import { CookieService } from 'ngx-cookie-service';
import { ClassroomDetailsService } from '../../day-care-management/classroom-management/classroom-details/classroom-details.service';
import { DcAppointmentsListService } from '../dc-appointments-list/dc-appointments-list.service';
import { CommonService } from '../../common-component/common.service';

describe('StudentMediaRequestComponent (parent-media-request)', () => {
  let component: StudentMediaRequestComponent;
  let fixture: ComponentFixture<StudentMediaRequestComponent>;

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
      if (key === 'UserId') return '33';
      return '';
    });

    modalSpy = jasmine.createSpy('modal');
    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: modalSpy,
    });

    applicationServiceSpy.getAllStudentMediaPlans.and.returnValue(
      of({ message: 'OK', result: [{ id: 1, name: 'Standard Plan' }] })
    );
    classroomDetailsServiceSpy.getStudentMediaRequest.and.returnValue(
      of({ message: 'OK', result: [{ id: 22, parentID: 6, centreID: 3 }] })
    );

    await TestBed.configureTestingModule({
      imports: [StudentMediaRequestComponent, ReactiveFormsModule],
      providers: [
        DatePipe,
        FormBuilder,
        ChangeDetectorRef,
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

    fixture = TestBed.createComponent(StudentMediaRequestComponent);
    component = fixture.componentInstance;
  });

  it('should create the component and initialize planForm', () => {
    expect(component).toBeTruthy();
    expect(component.planForm).toBeDefined();
  });

  describe('ngOnInit', () => {
    it('should read cookies and load media requests and plans', () => {
      component.ngOnInit();

      expect(cookieServiceSpy.get).toHaveBeenCalledWith('UserRoleId');
      expect(cookieServiceSpy.get).toHaveBeenCalledWith('UserId');
      expect(component.userRoleId).toBe(1);
      expect(component.userID).toBe(33);
      expect(classroomDetailsServiceSpy.getStudentMediaRequest).toHaveBeenCalledWith(1);
      expect(applicationServiceSpy.getAllStudentMediaPlans).toHaveBeenCalledWith(1);
      expect(component.StudentMediaRequest).toEqual([{ id: 22, parentID: 6, centreID: 3 }]);
    });
  });

  describe('Modal and Date Operations', () => {
    it('should populate modal properties on openModal', () => {
      const data = {
        parentID: 6,
        centreID: 3,
        startDate: '2026-10-10',
        endDate: '2026-10-15',
        fileSize: '1GB',
      };

      component.openModal(data);

      expect(component.parentID).toBe(6);
      expect(component.centreID).toBe(3);
      expect(component.selectedStartDate).toBe('2026-10-10');
      expect(component.selectedEndDate).toBe('2026-10-15');
      expect(component.selectedFileSize).toBe('1GB');
      expect(component.duration).toBe(5);
    });

    it('should set onSelectPlan in onPlanSelect', () => {
      component.onPlanSelect({ id: 88 });
      expect(component.onSelectPlan).toBe(88);
    });

    it('should reset data on submitPlan if planInformation exists', () => {
      component.planInformation = { id: 1 };
      component.submitPlan();
      expect(component.planInformation).toBeNull();
    });
  });

  describe('sendEmailStudentMediaRequest', () => {
    it('should send email and notify on success', () => {
      component.parentID = 6;
      component.onSelectPlan = '88';

      commonServiceSpy.sendEmailStudentMediaRequest.and.returnValue(
        of({ message: 'Success' })
      );

      component.sendEmailStudentMediaRequest();

      expect(commonServiceSpy.sendEmailStudentMediaRequest).toHaveBeenCalledWith(
        6,
        '88',
        'enc_88',
        'enc_6',
        'enc_studentMediaRequest'
      );
      expect(toastrSpy.success).toHaveBeenCalledWith('Email Sent Successfully');
      expect(modalSpy).toHaveBeenCalledWith('hide');
    });

    it('should notify error on failure', () => {
      component.parentID = 6;
      component.onSelectPlan = '88';

      commonServiceSpy.sendEmailStudentMediaRequest.and.returnValue(
        of({ message: 'Error' })
      );

      component.sendEmailStudentMediaRequest();

      expect(toastrSpy.error).toHaveBeenCalledWith('Something wents wrong !!');
      expect(spinnerSpy.hide).toHaveBeenCalled();
    });
  });
});
