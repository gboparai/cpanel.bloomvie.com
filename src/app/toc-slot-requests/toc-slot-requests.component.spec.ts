import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TocSlotRequestsComponent } from './toc-slot-requests.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TocSlotRequestsService } from './toc-slot-requests.service';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { TocRegistrationService } from '../toc-registration/toc-registration.service';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

describe('TocSlotRequestsComponent', () => {
  let component: TocSlotRequestsComponent;
  let fixture: ComponentFixture<TocSlotRequestsComponent>;
  let mockSlotService: jasmine.SpyObj<TocSlotRequestsService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockTocService: jasmine.SpyObj<TocRegistrationService>;

  beforeEach(async () => {
    mockSlotService = jasmine.createSpyObj('TocSlotRequestsService', [
      'getTocSlotbyUserid',
      'SendSlotRequestToDayCare'
    ]);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'warning', 'error', 'info']);
    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'set']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockTocService = jasmine.createSpyObj('TocRegistrationService', ['triggerSidebarRefresh']);

    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'UserId') return '101';
      if (key === 'CentreID') return '5';
      return '';
    });

    mockSlotService.getTocSlotbyUserid.and.returnValue(of({
      message: 'OK',
      result: [
        { centreId: 5, startTime: '09:00', endTime: '12:00', week: 'Week 1', workingDayName: 'Monday', acceptedByUser: '101', centreName: 'Happy Kids' },
        { centreId: 8, startTime: '13:00', endTime: '16:00', week: 'Week 1', workingDayName: 'Monday', acceptedByUser: '' }
      ],
      activity: [
        { requestByDayCare: 6, startTime: '09:00', endTime: '12:00', week: 'Week 1', workingDayName: 'Monday', acceptedByUser: 'UserB' }
      ]
    }));

    await TestBed.configureTestingModule({
      imports: [TocSlotRequestsComponent],
      providers: [
        { provide: TocSlotRequestsService, useValue: mockSlotService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: CookieService, useValue: mockCookieService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: TocRegistrationService, useValue: mockTocService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(TocSlotRequestsComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(TocSlotRequestsComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize UserID, centreID and call getTocSlotbyUserid', fakeAsync(() => {
      spyOn(window, 'scrollTo');
      spyOn(component, 'getTocSlotbyUserid').and.callThrough();

      component.ngOnInit();
      tick();

      expect(component.UserID).toBe(101);
      expect(component.centreID).toBe(5);
      expect(component.getTocSlotbyUserid).toHaveBeenCalled();
      expect(window.scrollTo).toHaveBeenCalled();
    }));
  });

  describe('getTocSlotbyUserid', () => {
    it('should filter requests by centreId and populate list when response is OK', async () => {
      await component.getTocSlotbyUserid();

      expect(mockSlotService.getTocSlotbyUserid).toHaveBeenCalledWith(101, 5);
      expect(component.skeletonShow).toBe('');
      expect(component.TocSlotRequests.length).toBe(1);
      expect(component.TocSlotRequests[0].centreId).toBe(5);
      expect(component.TocSlotList.length).toBe(1);
    });

    it('should empty requests and clear skeleton when response message is not OK', async () => {
      mockSlotService.getTocSlotbyUserid.and.returnValue(of({ message: 'Error', result: [] }));

      await component.getTocSlotbyUserid();

      expect(component.TocSlotRequests).toEqual([]);
      expect(component.TocSlotList).toEqual([]);
      expect(component.skeletonShow).toBe('');
    });
  });

  describe('Utility and Helper Methods', () => {
    it('should update ContentP on onPageChange', () => {
      component.onPageChange(2);
      expect(component.ContentP).toBe(2);
    });

    it('should format date range string properly', () => {
      const formatted = component.formatDateRange('2025-01-01 - 2025-01-15');
      expect(formatted).toBe('01/01/2025 - 01/15/2025');

      expect(component.formatDateRange('')).toBe('');
    });

    it('should determine isDisabled status based on TocSlotList acceptance', () => {
      component.TocSlotList = [
        {
          startTime: '09:00',
          endTime: '12:00',
          week: 'Week 1',
          workingDayName: 'Monday',
          acceptedByUser: 'User123'
        }
      ];

      const slotA = {
        startTime: '09:00',
        endTime: '12:00',
        week: 'Week 1',
        workingDayName: 'Monday'
      };
      const slotB = {
        startTime: '14:00',
        endTime: '17:00',
        week: 'Week 1',
        workingDayName: 'Monday'
      };

      expect(component.isDisabled(slotA)).toBeTrue();
      expect(component.isDisabled(slotB)).toBeFalse();
    });

    it('should determine isShowTooltip based on accepted slot by another daycare', () => {
      component.centreID = 5;
      component.TocSlotList = [
        {
          requestByDayCare: 6,
          acceptedByUser: 'User99',
          startTime: '09:00',
          endTime: '12:00',
          week: 'Week 1',
          workingDayName: 'Monday'
        }
      ];

      const slotMatch = {
        startTime: '09:00',
        endTime: '12:00',
        week: 'Week 1',
        workingDayName: 'Monday'
      };
      const slotNoMatch = {
        startTime: '13:00',
        endTime: '15:00',
        week: 'Week 1',
        workingDayName: 'Monday'
      };

      expect(component.isShowTooltip(slotMatch)).toBeTrue();
      expect(component.isShowTooltip(slotNoMatch)).toBeFalse();
    });

    it('should return daycare name from accepted slot in getAcceptedByDaycareName', () => {
      component.TocSlotRequests = [
        {
          acceptedByUser: 'User1',
          startTime: '09:00',
          endTime: '12:00',
          week: 'Week 1',
          workingDayName: 'Monday',
          centreName: 'Sun Valley'
        }
      ];

      const slot = {
        startTime: '09:00',
        endTime: '12:00',
        week: 'Week 1',
        workingDayName: 'Monday'
      };

      expect(component.getAcceptedByDaycareName(slot)).toBe('Sun Valley');

      const nonMatchingSlot = {
        startTime: '14:00',
        endTime: '16:00',
        week: 'Week 1',
        workingDayName: 'Monday'
      };
      expect(component.getAcceptedByDaycareName(nonMatchingSlot)).toBeNull();
    });

    it('should trigger getTocSlotbyUserid on onSearchName', () => {
      spyOn(component, 'getTocSlotbyUserid');

      component.Name = 'ab';
      component.onSearchName();
      expect(component.Name).toBe('');
      expect(component.getTocSlotbyUserid).toHaveBeenCalled();

      component.Name = 'Sunny Daycare';
      component.onSearchName();
      expect(component.getTocSlotbyUserid).toHaveBeenCalled();
    });
  });

  describe('SendSlotRequestToDayCare', () => {
    it('should handle Accepted slot response with Swal and toastr success', () => {
      spyOn(Swal, 'fire');
      spyOn(component, 'getTocSlotbyUserid');

      mockSlotService.SendSlotRequestToDayCare.and.returnValue(of({
        message: 'OK',
        activity: 'Accepted successfully'
      }));

      component.SendSlotRequestToDayCare(5, 12, 'Accepted');

      expect(mockSlotService.SendSlotRequestToDayCare).toHaveBeenCalledWith(5, 12, 101, 'Accepted');
      expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
        icon: 'success',
        text: 'Request Accepted successfully.'
      }));
      expect(mockToastr.success).toHaveBeenCalledWith('Accepted successfully');
      expect(mockCookieService.set).toHaveBeenCalledWith('isSlotAccepted', 'true');
      expect(mockTocService.triggerSidebarRefresh).toHaveBeenCalled();
      expect(component.getTocSlotbyUserid).toHaveBeenCalled();
    });

    it('should handle Rejected slot response with Swal and toastr', () => {
      spyOn(Swal, 'fire');
      spyOn(component, 'getTocSlotbyUserid');

      mockSlotService.SendSlotRequestToDayCare.and.returnValue(of({
        message: 'OK',
        activity: 'Rejected successfully'
      }));

      component.SendSlotRequestToDayCare(5, 12, 'Rejected');

      expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
        icon: 'success',
        text: 'Request Rejected successfully.'
      }));
      expect(mockToastr.success).toHaveBeenCalledWith('Rejected successfully');
    });

    it('should show toastr warning on non-OK message', () => {
      mockSlotService.SendSlotRequestToDayCare.and.returnValue(of({
        message: 'Failed to update slot'
      }));

      component.SendSlotRequestToDayCare(5, 12, 'Accepted');

      expect(mockToastr.warning).toHaveBeenCalledWith('Failed to update slot');
    });
  });

  describe('slotApproveReject Modal Interaction', () => {
    it('should open confirmation modal and handle Accept choice', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      spyOn(component, 'SendSlotRequestToDayCare');

      component.slotApproveReject(5, 12);
      tick(600);

      expect(component.SendSlotRequestToDayCare).toHaveBeenCalledWith(5, 12, 'Accepted');
    }));

    it('should prompt for rejection reason when Denied (Reject clicked)', fakeAsync(() => {
      const swalSpy = spyOn(Swal, 'fire');
      swalSpy.and.returnValues(
        Promise.resolve({ isDenied: true } as any),
        Promise.resolve({ isConfirmed: true, value: 'Schedule conflict' } as any)
      );
      spyOn(component, 'SendSlotRequestToDayCare');

      component.slotApproveReject(5, 12);
      tick(600);

      expect(component.SendSlotRequestToDayCare).toHaveBeenCalledWith(5, 12, 'Rejected');
    }));
  });
});
