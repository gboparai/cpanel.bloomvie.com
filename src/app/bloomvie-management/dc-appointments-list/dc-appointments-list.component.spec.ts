import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { DcAppointmentsListComponent } from './dc-appointments-list.component';
import { DcAppointmentsListService } from './dc-appointments-list.service';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { ApplicationsSettingsService } from '../../settings/application-settings/applications-settings/applications-settings.service';
import { CommonService } from '../../common-component/common.service';
import Swal from 'sweetalert2';

describe('DcAppointmentsListComponent', () => {
  let component: DcAppointmentsListComponent;
  let fixture: ComponentFixture<DcAppointmentsListComponent>;

  let serviceSpy: jasmine.SpyObj<DcAppointmentsListService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;
  let cookieServiceSpy: jasmine.SpyObj<CookieService>;
  let appServiceSpy: jasmine.SpyObj<ApplicationsSettingsService>;
  let commonServiceSpy: jasmine.SpyObj<CommonService>;
  let modalSpy: jasmine.Spy;

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('DcAppointmentsListService', [
      'getDayCareAppointments',
      'getFilteredData',
      'getZoomMeetingLink',
      'ManageCousellor',
      'dayCareAssignmentToCounsellor',
      'getIntersetedUserByID',
      'getAllCounsellorBySlotID',
      'completeDaycareMeeting',
      'changeDayCareRequest',
      'dayCareMeetingJoined',
    ]);
    toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);
    cookieServiceSpy = jasmine.createSpyObj('CookieService', ['get']);
    appServiceSpy = jasmine.createSpyObj('ApplicationsSettingsService', ['GetNofications']);
    commonServiceSpy = jasmine.createSpyObj('CommonService', ['getUtcTime']);

    (commonServiceSpy as any).regionResponseSignal = signal({
      offsetHours: 0,
      offsetMinutes: 0,
      offsetString: '+00:00',
    });

    cookieServiceSpy.get.and.callFake((key: string) => {
      if (key === 'UserId') return '10';
      if (key === 'UserRoleId') return '1';
      if (key === 'UserInfo') {
        return JSON.stringify({
          result: {
            firstName: 'Super',
            middleName: 'Admin',
            lastName: 'User',
          },
        });
      }
      return '';
    });

    modalSpy = jasmine.createSpy('modal');
    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: modalSpy,
    });

    serviceSpy.getDayCareAppointments.and.returnValue(
      of({
        message: 'Success',
        result: [
          { id: 1, counsellorID: 10, email: 'user1@test.com' },
          { id: 2, counsellorID: 20, email: 'user2@test.com' },
        ],
      })
    );
    appServiceSpy.GetNofications.and.returnValue(
      of({ message: 'ok', result: [{ id: 1, message: 'Notification 1' }] })
    );

    await TestBed.configureTestingModule({
      imports: [DcAppointmentsListComponent],
      providers: [
        DatePipe,
        FormBuilder,
        { provide: DcAppointmentsListService, useValue: serviceSpy },
        { provide: ToastrService, useValue: toastrSpy },
        { provide: CookieService, useValue: cookieServiceSpy },
        { provide: ApplicationsSettingsService, useValue: appServiceSpy },
        { provide: CommonService, useValue: commonServiceSpy },
        { provide: ActivatedRoute, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DcAppointmentsListComponent);
    component = fixture.componentInstance;
  });

  it('should create the component and initialize forms', () => {
    expect(component).toBeTruthy();
    expect(component.Form).toBeDefined();
    expect(component.zoomMeetingForm).toBeDefined();
  });

  describe('ngOnInit', () => {
    it('should initialize UserID, userRoleID, fullName, and viewAction', () => {
      component.ngOnInit();

      expect(component.UserID).toBe(10);
      expect(component.userRoleID).toBe(1);
      expect(component.fullName).toBe('Super Admin User');
      expect(component.viewAction).toBe(true);
      expect(component.userOffset).toMatch(/^[+-]\d{2}:\d{2}$/);
    });

    it('should set viewAction to false if UserRoleId is not 1', () => {
      cookieServiceSpy.get.and.callFake((key: string) => {
        if (key === 'UserRoleId') return '2';
        return '';
      });

      component.assignAction();
      expect(component.viewAction).toBe(false);
    });
  });

  describe('Appointment Listing and Filtering', () => {
    it('should fetch accepted appointments when status is Accepted', () => {
      component.region = { offsetHours: 0, offsetMinutes: 0 };
      component.getAllDayCareAppointments('Accepted', '');

      expect(serviceSpy.getDayCareAppointments).toHaveBeenCalledWith(6, '', 0, 0);
      expect(component.DayCareAppointmentsAcceptedData.length).toBe(2);
      expect(component.filteredAcceptbyCounsellor.length).toBe(1);
      expect(appServiceSpy.GetNofications).toHaveBeenCalledWith(10);
      expect(component.skeletonShow).toBe('');
    });

    it('should fetch pending appointments for role 1 without calling getFilteredData', () => {
      component.region = { offsetHours: 0, offsetMinutes: 0 };
      component.userRoleID = 1;
      component.getAllDayCareAppointments('Pending', '');

      expect(serviceSpy.getDayCareAppointments).toHaveBeenCalledWith(3, '', 0, 0);
      expect(serviceSpy.getFilteredData).not.toHaveBeenCalled();
      expect(component.DayCareAppointmentsPendingData.length).toBe(2);
    });

    it('should filter pending appointments if userRoleID is not 1', () => {
      component.region = { offsetHours: 0, offsetMinutes: 0 };
      component.userRoleID = 6;
      component.UserID = 10;

      serviceSpy.getFilteredData.and.returnValue(
        of({
          message: 'Success',
          result: [
            { id: 1, counsellorID: 10 },
            { id: 2, counsellorID: 20 },
          ],
        })
      );

      component.getAllDayCareAppointments('Pending', '');

      expect(serviceSpy.getFilteredData).toHaveBeenCalledWith({
        counsellorID: 10,
        list: jasmine.any(Array),
      });
      // filtered out counsellorID === 10
      expect(component.DayCareAppointmentsPendingData.length).toBe(1);
      expect(component.DayCareAppointmentsPendingData[0].counsellorID).toBe(20);
    });

    it('should check if appointment is accepted via isAccepted(id)', () => {
      component.filteredAcceptbyCounsellor = [{ id: 5 }, { id: 10 }];
      expect(component.isAccepted(5)).toBe(true);
      expect(component.isAccepted(99)).toBe(false);
    });
  });

  describe('Duration and Time Helpers', () => {
    it('should convert time string properly', () => {
      const result = component.convertToTimeString('09:30:00');
      expect(result).toBe('09:30');
    });

    it('should calculate duration in minutes', () => {
      const minutes = component.calculateDuration('09:00:00', '10:30:00');
      expect(minutes).toBe('90');
    });

    it('should add duration to a dateTime', () => {
      const result = component.addDuration('2026-10-25T00:00:00Z', '01:00:00');
      expect(result).toBeDefined();
    });
  });

  describe('Counsellor Assignment and Zoom Meeting', () => {
    it('should create zoom meeting and assign counsellor', () => {
      component.region = { offsetHours: '0', offsetMinutes: '0' };
      component.userRoleID = 1;
      component.UserID = 10;
      component.counsellorName = 15;
      component.DaycareIdUserID = 100;

      serviceSpy.getZoomMeetingLink.and.returnValue(
        of({
          message: 'Success',
          result: JSON.stringify({
            join_url: 'https://zoom.us/j/123',
            start_url: 'https://zoom.us/s/123',
          }),
        })
      );
      serviceSpy.ManageCousellor.and.returnValue(of({ message: 'Success' }));
      serviceSpy.dayCareAssignmentToCounsellor.and.returnValue(of({ message: 'Success' }));

      const interestedUser = {
        slotDate: '2026-10-25T00:00:00Z',
        slotStartTime: '09:00:00',
        slotEndTime: '10:00:00',
        email: 'parent@test.com',
      };

      component.AssiggnCounsellor(interestedUser);

      expect(serviceSpy.getZoomMeetingLink).toHaveBeenCalled();
      expect(serviceSpy.ManageCousellor).toHaveBeenCalled();
      expect(toastrSpy.success).toHaveBeenCalledWith('Request Confirm');
    });

    it('should handle error when zoom meeting link fails', () => {
      component.region = { offsetHours: '0', offsetMinutes: '0' };
      serviceSpy.getZoomMeetingLink.and.returnValue(of({ message: 'Error' }));

      component.AssiggnCounsellor({
        slotDate: '2026-10-25T00:00:00Z',
        slotStartTime: '09:00:00',
        slotEndTime: '10:00:00',
        email: 'parent@test.com',
      });

      expect(toastrSpy.error).toHaveBeenCalledWith('Something wents wrong !!');
    });

    it('should update counsellorID on onCounsellorChange', () => {
      component.onCounsellorChange({ id: 99 });
      expect(component.counsellorID).toBe(99);
    });

    it('should fetch interested user details in getByID', () => {
      component.region = { offsetHours: 0, offsetMinutes: 0 };
      serviceSpy.getIntersetedUserByID.and.returnValue(
        of({ message: 'ok', result: { id: 7, name: 'Alice' } })
      );

      component.getByID(7);

      expect(modalSpy).toHaveBeenCalledWith('show');
      expect(serviceSpy.getIntersetedUserByID).toHaveBeenCalledWith(7, 0, 0);
      expect(component.InterestedUser).toEqual({ id: 7, name: 'Alice' });
      expect(component.AcceptSkekletonLoader).toBe(false);
    });

    it('should fetch details and slot counsellors in getByIDForView', fakeAsync(() => {
      component.region = { offsetHours: 0, offsetMinutes: 0 };
      serviceSpy.getAllCounsellorBySlotID.and.returnValue(
        of({ message: 'Success', result: [{ id: 1, name: 'Counsellor A' }] })
      );
      serviceSpy.getIntersetedUserByID.and.returnValue(
        of({ message: 'ok', result: { id: 8, name: 'Bob' } })
      );

      component.getByIDForView(8, 55);
      tick();

      expect(serviceSpy.getAllCounsellorBySlotID).toHaveBeenCalledWith(55);
      expect(component.counsellorList.length).toBe(1);
      expect(component.displayInterestedUser).toEqual({ id: 8, name: 'Bob' });
      expect(modalSpy).toHaveBeenCalledWith('show');
    }));
  });

  describe('Search and Page Control', () => {
    it('should search pending appointments when query >= 3', () => {
      spyOn(component, 'getAllDayCareAppointments');
      component.pendingSearchItem = 'Sunny';

      component.getPendingSearchItem();

      expect(component.getAllDayCareAppointments).toHaveBeenCalledWith('Pending', 'sunny');
    });

    it('should reset pendingSearchItem if query < 3', () => {
      spyOn(component, 'getAllDayCareAppointments');
      component.pendingSearchItem = 'Su';

      component.getPendingSearchItem();

      expect(component.pendingSearchItem).toBe('');
      expect(component.getAllDayCareAppointments).toHaveBeenCalledWith('Pending', '');
    });

    it('should search accepted appointments when query >= 3', () => {
      spyOn(component, 'getAllDayCareAppointments');
      component.acceptedSearchItem = 'Bloom';

      component.getAcceptedSearchItem();

      expect(component.getAllDayCareAppointments).toHaveBeenCalledWith('Accepted', 'bloom');
    });

    it('should adjust pageControlAcceptedList and pageControlPendingList', () => {
      component.AppointmentListAcceptedLength = 2;
      component.ContentsizeAcceptedList = 5;
      component.ContentAcceptedList = 3;

      component.pageControlAcceptedList();
      expect(component.ContentAcceptedList).toBe(1);

      component.AppointmentListPendingLength = 2;
      component.ContentsizePendingList = 5;
      component.ContentPendingList = 4;

      component.pageControlPendingList();
      expect(component.ContentPendingList).toBe(1);
    });
  });

  describe('Action Dialogs and Modals', () => {
    it('should complete meeting when confirmed in Swal', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      serviceSpy.completeDaycareMeeting.and.returnValue(of({ message: 'Success' }));
      spyOn(component, 'getAllDayCareAppointments');

      component.completeMeeting(12);
      tick();

      expect(serviceSpy.completeDaycareMeeting).toHaveBeenCalledWith(12);
      expect(component.getAllDayCareAppointments).toHaveBeenCalledWith('Accepted', '');
    }));

    it('should change appointment request when confirmed in Swal', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      serviceSpy.changeDayCareRequest.and.returnValue(of({ message: 'Success' }));
      spyOn(component, 'getAllDayCareAppointments');

      component.changeAppointmentRequest(15);
      tick();

      expect(serviceSpy.changeDayCareRequest).toHaveBeenCalledWith(15);
      expect(component.getAllDayCareAppointments).toHaveBeenCalledWith('Accepted', '');
    }));

    it('should join Zoom meeting and open host link when confirmed', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      spyOn(window, 'open');
      component.region = { offsetHours: '0', offsetMinutes: '0' };

      serviceSpy.dayCareMeetingJoined.and.returnValue(of({ message: 'Success' }));
      serviceSpy.getIntersetedUserByID.and.returnValue(
        of({ message: 'ok', result: { hostLink: 'https://zoom.us/s/test' } })
      );

      component.joinZoomMeeting(20);
      tick();

      expect(serviceSpy.dayCareMeetingJoined).toHaveBeenCalledWith(20);
      expect(window.open).toHaveBeenCalledWith('https://zoom.us/s/test', '_blank');
    }));

    it('should close manual add appointment modal', () => {
      component.closingManualAddAppointmentModal();
      expect(modalSpy).toHaveBeenCalledWith('hide');
    });

    it('should delegate resetConsullorSelectedValue to child component', () => {
      component.daycareManualAppointmentChildComponent = {
        resetConsullorSelectedValue: jasmine.createSpy('resetConsullorSelectedValue'),
      } as any;

      component.resetConsullorSelectedValue();

      expect(
        component.daycareManualAppointmentChildComponent.resetConsullorSelectedValue
      ).toHaveBeenCalled();
    });

    it('should reset counsellorName on onClose', () => {
      component.counsellorName = 'Doctor';
      component.onClose();
      expect(component.counsellorName).toBeNull();
    });
  });
});
