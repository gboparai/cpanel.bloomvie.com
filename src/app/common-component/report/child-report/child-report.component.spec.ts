import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChildReportComponent } from './child-report.component';
import { ClassroomDetailsService } from '../../../day-care-management/classroom-management/classroom-details/classroom-details.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { CommonService } from '../../common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

describe('ChildReportComponent', () => {
  let component: ChildReportComponent;
  let fixture: ComponentFixture<ChildReportComponent>;

  let mockClassroomService: jasmine.SpyObj<ClassroomDetailsService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockDatePipe: jasmine.SpyObj<DatePipe>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal'),
      val: jasmine.createSpy('val'),
      fancybox: jasmine.createSpy('fancybox')
    });

    mockClassroomService = jasmine.createSpyObj('ClassroomDetailsService', [
      'getStudentDetails',
      'manageStudentRequest',
      'getStudentProfileByStudentID'
    ]);
    mockClassroomService.getStudentDetails.and.returnValue(of({
      message: 'OK',
      result: [
        {
          date: '2026-05-15',
          studentActivities: [
            { activityID: 1, activityName: 'Painting', media: ['pic.jpg'] }
          ]
        }
      ]
    }));
    mockClassroomService.manageStudentRequest.and.returnValue(of({ message: 'Success' }));
    mockClassroomService.getStudentProfileByStudentID.and.returnValue(of({
      message: 'OK',
      result: { studentFirstName: 'Leo', studentLastName: 'DaVinci' }
    }));

    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);

    mockDatePipe = jasmine.createSpyObj('DatePipe', ['transform']);
    mockDatePipe.transform.and.returnValue('05/15/2026');

    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'set', 'delete', 'check']);
    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'CentreID') return '10';
      if (key === 'UserRoleId') return '5';
      if (key === 'UserId') return '100';
      if (key === 'StudentID') return '12';
      return '';
    });

    mockCommonService = jasmine.createSpyObj('CommonService', [
      'encrypt',
      'getBloomvieSettings'
    ]);
    mockCommonService.encrypt.and.callFake((val: string) => `enc_${val}`);
    mockCommonService.getBloomvieSettings.and.returnValue(of({
      message: 'Success',
      result: { costPerGB: 5 }
    }));

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ChildReportComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: () => '12' },
              queryParamMap: { get: () => null }
            }
          }
        },
        { provide: ClassroomDetailsService, useValue: mockClassroomService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: DatePipe, useValue: mockDatePipe },
        { provide: CookieService, useValue: mockCookieService },
        { provide: CommonService, useValue: mockCommonService },
        { provide: Router, useValue: mockRouter }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(ChildReportComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChildReportComponent);
    component = fixture.componentInstance;
  });

  it('should create the ChildReportComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize studentID from route or cookies and fetch student details', () => {
      component.studentID = '12';
      component.getStudentData();

      expect(mockClassroomService.getStudentDetails).toHaveBeenCalled();
      expect(component.studentData.length).toBe(1);
    });
  });

  describe('Date helpers', () => {
    it('should format date using DatePipe', () => {
      const d = new Date('2026-05-15');
      const res = component.formatDate(d);
      expect(res).toBe('05/15/2026');
      expect(mockDatePipe.transform).toHaveBeenCalledWith(d, 'MM/dd/yyyy');
    });

    it('should verify isWithinLast7Days', () => {
      const today = new Date();
      const past2Days = new Date();
      past2Days.setDate(today.getDate() - 2);

      expect(component.isWithinLast7Days(past2Days.toISOString())).toBeTrue();
    });

    it('should check isNextDateDisabled correctly when current date is selected', () => {
      component.CurrentDate = new Date();
      component.selectedDate = new Date();
      expect(component.isNextDateDisabled()).toBeTrue();
    });
  });

  describe('Media and Activity helpers', () => {
    it('should detect video extensions with isVideo', () => {
      expect(component.isVideo('sample.mp4')).toBeTrue();
      expect(component.isVideo('sample.mov')).toBeTrue();
      expect(component.isVideo('sample.jpg')).toBeFalse();
    });

    it('should slice first two images with getFirstTwoImages', () => {
      const item = { studentActivityImages: ['img1.jpg', 'img2.jpg', 'img3.jpg'] };
      const res = component.getFirstTwoImages(item);
      expect(res.length).toBe(2);
      expect(res).toEqual(['img1.jpg', 'img2.jpg']);
    });
  });

  describe('UI Event Handlers', () => {
    it('should prevent default on disableRightClick', () => {
      const event = new MouseEvent('contextmenu');
      spyOn(event, 'preventDefault');
      component.disableRightClick(event);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should prevent default on disableDrag', () => {
      const event = new DragEvent('dragstart');
      spyOn(event, 'preventDefault');
      component.disableDrag(event);
      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  describe('Settings and Profile calls', () => {
    it('should get Bloomvie settings and compute totalCost', () => {
      component.fileSize = 2048; // 2 GB
      component.getBloomvieSettings();

      expect(mockCommonService.getBloomvieSettings).toHaveBeenCalledWith(1);
      expect(component.bloomvieSettings).toBeDefined();
      expect(component.totalCost).toBe(10);
    });

    it('should load student profile details', () => {
      component.studentID = '12';
      component.getStudentProfileDetails();

      expect(mockClassroomService.getStudentProfileByStudentID).toHaveBeenCalledWith('12');
      expect(component.studentDetails).toBeDefined();
    });
  });

  describe('TrackBy functions', () => {
    it('should return appropriate trackBy values', () => {
      expect(component.trackByIndex(2, {})).toBe(2);
      expect(component.trackByDay(1, { day: 'Monday' })).toBe('Monday');
      expect(component.trackByItem(1, { id: 99 })).toBe(99);
      expect(component.trackByDate(1, { date: '2026-05-15' })).toBe('2026-05-15');
    });
  });
});
