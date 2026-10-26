import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventsComponent } from './events.component';
import { CommonService } from '../common.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ViewStudentEnrollmentService } from '../../day-care-management/student-management/view-student-enrollment/view-student-enrollment.service';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

describe('EventsComponent', () => {
  let component: EventsComponent;
  let fixture: ComponentFixture<EventsComponent>;

  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockViewStudent: jasmine.SpyObj<ViewStudentEnrollmentService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockCookieService: jasmine.SpyObj<CookieService>;

  beforeEach(async () => {
    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal'),
      val: jasmine.createSpy('val')
    });

    mockCommonService = jasmine.createSpyObj('CommonService', [
      'deleteEvent',
      'getMasterEvent',
      'manageDaycareCentreEventManagment',
      'getEventsByDayCareId'
    ]);
    mockCommonService.deleteEvent.and.returnValue(of({ message: 'OK' }));
    mockCommonService.getMasterEvent.and.returnValue(of({
      message: 'OK',
      result: [{ eventTypeID: 1, eventTypeName: 'Holiday' }]
    }));
    mockCommonService.manageDaycareCentreEventManagment.and.returnValue(of({ message: 'OK' }));
    mockCommonService.getEventsByDayCareId.and.returnValue(of({
      message: 'OK',
      result: [
        {
          id: 1,
          title: 'Sports Day',
          start: '2026-05-20',
          color: '#3498db'
        }
      ]
    }));

    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockViewStudent = jasmine.createSpyObj('ViewStudentEnrollmentService', ['getStudentDetailsById']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);

    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'set', 'delete', 'check']);
    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'CentreID') return '10';
      if (key === 'UserRoleId') return '3';
      if (key === 'UserId') return '101';
      return '';
    });

    await TestBed.configureTestingModule({
      imports: [EventsComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: CommonService, useValue: mockCommonService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: ViewStudentEnrollmentService, useValue: mockViewStudent },
        { provide: ToastrService, useValue: mockToastr },
        { provide: CookieService, useValue: mockCookieService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(EventsComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventsComponent);
    component = fixture.componentInstance;
  });

  it('should create the EventsComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize calendarOptions and read cookies', () => {
      spyOn(component, 'getMasterEvent').and.resolveTo();
      spyOn(component, 'getEventsByDayCareId').and.resolveTo();

      component.ngOnInit();

      expect(component.DayCareId).toBe('10');
      expect(component.userRoleID).toBe('3');
      expect(component.UserID).toBe('101');
      expect(component.calendarOptions).toBeDefined();
      expect(component.getMasterEvent).toHaveBeenCalled();
      expect(component.getEventsByDayCareId).toHaveBeenCalledWith('10');
    });
  });

  describe('Form Handling and Reset', () => {
    it('should reset form controls with resetForm', () => {
      component.eventForm.patchValue({
        eventName: 'Picnic',
        eventDescription: 'Annual picnic'
      });
      component.resetForm();

      expect(component.eventForm.value.eventName).toBeNull();
      expect(component.IsEdit).toBeFalse();
      expect(component.selectedLabel).toBe('Select One');
    });
  });

  describe('Color Dropdown', () => {
    it('should toggle dropdown', () => {
      expect(component.isOpen).toBeFalse();
      component.toggleDropdown();
      expect(component.isOpen).toBeTrue();
    });

    it('should select color and emit selectedColor output', () => {
      const emitSpy = spyOn(component.selectedColor, 'emit');
      component.selectColor({ value: '#2ecc71', label: 'Green' });

      expect(component.selectedValue).toBe('#2ecc71');
      expect(component.selectedLabel).toBe('Green');
      expect(component.isOpen).toBeFalse();
      expect(emitSpy).toHaveBeenCalledWith('#2ecc71');
      expect(component.eventForm.value.colorLable).toBe('#2ecc71');
    });
  });

  describe('onSubmitEvent', () => {
    it('should submit event successfully when form is valid', () => {
      component.DayCareId = '10';
      component.UserID = '101';
      component.eventForm.patchValue({
        eventName: 'Art Fest',
        eventDescription: 'Painting contest',
        colorLable: '#3498db',
        eventTypeID: 1
      });

      spyOn(component, 'getEventsByDayCareId').and.resolveTo();
      component.onSubmitEvent();

      expect(mockCommonService.manageDaycareCentreEventManagment).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Event created successfully!');
    });
  });

  describe('deleteEvent', () => {
    it('should call commonService to delete event and reload events', () => {
      component.DayCareId = '10';
      spyOn(component, 'getEventsByDayCareId').and.resolveTo();

      component.deleteEvent(5);

      expect(mockCommonService.deleteEvent).toHaveBeenCalledWith(5, '10');
      expect(mockToastr.success).toHaveBeenCalledWith('Event deleted successfully.');
      expect(component.getEventsByDayCareId).toHaveBeenCalledWith('10');
    });
  });
});
