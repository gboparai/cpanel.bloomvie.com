import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
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

describe('StudentMediaRequestComponent (student-media-request)', () => {
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
      'getSubscriptionPlansByID',
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
      if (key === 'UserId') return '55';
      return '';
    });

    modalSpy = jasmine.createSpy('modal');
    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: modalSpy,
    });

    applicationServiceSpy.getAllStudentMediaPlans.and.returnValue(
      of({ message: 'OK', result: [{ id: 1, name: 'Premium Plan' }] })
    );
    applicationServiceSpy.getSubscriptionPlansByID.and.returnValue(
      of({ message: 'Success', result: { id: 2, description: 'Details' } })
    );
    classroomDetailsServiceSpy.getStudentMediaRequest.and.returnValue(
      of({ message: 'OK', result: [{ id: 50, parentID: 8, centreID: 4 }] })
    );

    await TestBed.configureTestingModule({
      imports: [StudentMediaRequestComponent, ReactiveFormsModule],
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

    fixture = TestBed.createComponent(StudentMediaRequestComponent);
    component = fixture.componentInstance;
  });

  it('should create the component and initialize planForm', () => {
    expect(component).toBeTruthy();
    expect(component.planForm).toBeDefined();
    expect(component.selectedUser).toBeDefined();
  });

  describe('ngOnInit', () => {
    it('should initialize cookies, fetch media requests and plans', () => {
      component.ngOnInit();

      expect(cookieServiceSpy.get).toHaveBeenCalledWith('UserRoleId');
      expect(cookieServiceSpy.get).toHaveBeenCalledWith('UserId');
      expect(component.userRoleId).toBe(1);
      expect(component.userID).toBe(55);
      expect(classroomDetailsServiceSpy.getStudentMediaRequest).toHaveBeenCalledWith(1);
      expect(applicationServiceSpy.getAllStudentMediaPlans).toHaveBeenCalledWith(1);
      expect(component.StudentMediaRequest).toEqual([{ id: 50, parentID: 8, centreID: 4 }]);
      expect(component.getPlansList).toEqual([{ id: 1, name: 'Premium Plan' }]);
    });
  });

  describe('openModal and selection', () => {
    it('should populate selectedUser and compute duration on openModal', () => {
      const data = {
        parentID: 8,
        parentName: 'Sam Parent',
        daycareName: 'Bright Kids',
        email: 'sam@bright.com',
        centreID: 4,
        startDate: '2026-10-10',
        endDate: '2026-10-20',
        fileSize: '2GB',
      };

      component.openModal(data);

      expect(component.parentID).toBe(8);
      expect(component.selectedUser.parentName).toBe('Sam Parent');
      expect(component.selectedUser.daycareName).toBe('Bright Kids');
      expect(component.selectedUser.email).toBe('sam@bright.com');
      expect(component.selectedUser.duration).toBe(10);
    });

    it('should select plan and fetch plan details in onPlanSelect', fakeAsync(() => {
      component.onPlanSelect({ id: 2 });
      tick();

      expect(component.onSelectPlan).toBe(2);
      expect(applicationServiceSpy.getSubscriptionPlansByID).toHaveBeenCalledWith(2);
      expect(component.planDescriptionDetails).toEqual({ id: 2, description: 'Details' });
      expect(spinnerSpy.hide).toHaveBeenCalled();
    }));

    it('should reset data on submitPlan', () => {
      component.planInformation = { plan: 'Test' };
      component.submitPlan();
      expect(component.planInformation).toBeNull();
    });
  });

  describe('sendEmailStudentMediaRequest', () => {
    it('should send media request email and refresh list on success', () => {
      component.parentID = 8;
      component.onSelectPlan = '2';

      commonServiceSpy.sendEmailStudentMediaRequest.and.returnValue(
        of({ message: 'Success' })
      );
      spyOn(component, 'getStudentMediaRequest');

      component.sendEmailStudentMediaRequest();

      expect(commonServiceSpy.sendEmailStudentMediaRequest).toHaveBeenCalledWith(
        8,
        '2',
        'enc_2',
        'enc_8',
        'enc_studentMediaRequest'
      );
      expect(toastrSpy.success).toHaveBeenCalledWith('Email Sent Successfully');
      expect(component.getStudentMediaRequest).toHaveBeenCalled();
      expect(modalSpy).toHaveBeenCalledWith('hide');
      expect(spinnerSpy.hide).toHaveBeenCalled();
    });

    it('should notify error on failure in sendEmailStudentMediaRequest', () => {
      component.parentID = 8;
      component.onSelectPlan = '2';

      commonServiceSpy.sendEmailStudentMediaRequest.and.returnValue(
        of({ message: 'Error' })
      );

      component.sendEmailStudentMediaRequest();

      expect(toastrSpy.error).toHaveBeenCalledWith('Something wents wrong !!');
      expect(spinnerSpy.hide).toHaveBeenCalled();
    });
  });
});
