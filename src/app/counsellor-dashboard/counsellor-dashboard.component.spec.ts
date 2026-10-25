import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CounsellorDashboardComponent } from './counsellor-dashboard.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CounsellorDashboardService } from './counsellor-dashboard.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AssignUserPermissionService } from '../settings/Permission/assign-user-permission/assign-user-permission.service';
import { CommonService } from '../common-component/common.service';
import { of, throwError } from 'rxjs';

describe('CounsellorDashboardComponent', () => {
  let component: CounsellorDashboardComponent;
  let fixture: ComponentFixture<CounsellorDashboardComponent>;
  let mockService: jasmine.SpyObj<CounsellorDashboardService>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockPermissionService: jasmine.SpyObj<AssignUserPermissionService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('CounsellorDashboardService', [
      'getTodaysMeetings',
      'getCounsellorDashboardCount'
    ]);
    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'set']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);
    mockPermissionService = jasmine.createSpyObj('AssignUserPermissionService', ['getUserPermission']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['encrypt', 'decrypt']);

    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'UserId') return '101';
      return '';
    });

    mockService.getTodaysMeetings.and.returnValue(of({
      message: 'Success',
      result: [
        { id: 1, meetingTitle: 'Consultation with Daycare A', time: '10:00' }
      ]
    }));

    mockService.getCounsellorDashboardCount.and.returnValue(of({
      message: 'Success',
      result: {
        pendingAppointmentCount: 4,
        assignedDaycareCount: 8
      }
    }));

    mockCommonService.encrypt.and.callFake((val: string) => `enc_${val}`);

    await TestBed.configureTestingModule({
      imports: [CounsellorDashboardComponent],
      providers: [
        { provide: CounsellorDashboardService, useValue: mockService },
        { provide: CookieService, useValue: mockCookieService },
        { provide: Router, useValue: mockRouter },
        { provide: ToastrService, useValue: mockToastr },
        { provide: AssignUserPermissionService, useValue: mockPermissionService },
        { provide: CommonService, useValue: mockCommonService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(CounsellorDashboardComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(CounsellorDashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize userId and call getTodaysMeetings and getDashboardCount', () => {
      spyOn(component, 'getTodaysMeetings').and.callThrough();
      spyOn(component, 'getDashboardCount').and.callThrough();

      component.ngOnInit();

      expect(mockCookieService.get).toHaveBeenCalledWith('UserId');
      expect(component.userId).toBe(101);
      expect(component.getTodaysMeetings).toHaveBeenCalled();
      expect(component.getDashboardCount).toHaveBeenCalled();
    });
  });

  describe('getTodaysMeetings', () => {
    it('should populate meetingDetails when service returns Success', () => {
      component.userId = 101;
      component.getTodaysMeetings();

      expect(mockService.getTodaysMeetings).toHaveBeenCalledWith(101);
      expect(component.meetingDetails.length).toBe(1);
      expect(component.meetingDetails[0].meetingTitle).toBe('Consultation with Daycare A');
    });

    it('should not update meetingDetails on non-Success message', () => {
      mockService.getTodaysMeetings.and.returnValue(of({ message: 'Error', result: [] }));
      component.meetingDetails = [];
      component.getTodaysMeetings();

      expect(component.meetingDetails).toEqual([]);
    });
  });

  describe('getAppointmentInfo', () => {
    it('should set meetInfo and set handleView to true', () => {
      const mockMeet = { id: 10, title: 'Advisory Session' };
      component.getAppointmentInfo(mockMeet);

      expect(component.meetInfo).toEqual(mockMeet);
      expect(component.handleView).toBeTrue();
    });
  });

  describe('getDashboardCount', () => {
    it('should set dashboard counters when service returns Success', () => {
      component.userId = 101;
      component.getDashboardCount();

      expect(mockService.getCounsellorDashboardCount).toHaveBeenCalledWith(101, '');
      expect(component.pendingActionsCount).toBe(4);
      expect(component.assignedDayCaresCount).toBe(8);
      expect(component.DayCaresCount).toBe('');
    });

    it('should clear DayCaresCount when service returns non-Success', () => {
      mockService.getCounsellorDashboardCount.and.returnValue(of({ message: 'Failed' }));
      component.getDashboardCount();

      expect(component.DayCaresCount).toBe('');
    });
  });

  describe('Navigation Methods', () => {
    it('should navigate to /chatbox on navigateToChatbox', () => {
      component.navigateToChatbox();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/chatbox']);
    });

    it('should navigate to /dc-appointments-list on navigateToAppointmentList', () => {
      component.navigateToAppointmentList();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dc-appointments-list']);
    });

    it('should encrypt userId and navigate to /daycare-assigned-counsellor-organogram on navigateToAssignedDaycares', () => {
      component.userId = 101;
      component.navigateToAssignedDaycares();

      expect(mockCommonService.encrypt).toHaveBeenCalledWith('101');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/daycare-assigned-counsellor-organogram'], {
        queryParams: { id: 'enc_101' }
      });
    });
  });
});
