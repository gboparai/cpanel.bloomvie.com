import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ViewDaycareComponent } from './view-daycare.component';
import { ViewDaycareService } from './view-daycare.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '../../common-component/common.service';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

describe('ViewDaycareComponent', () => {
  let component: ViewDaycareComponent;
  let fixture: ComponentFixture<ViewDaycareComponent>;
  let mockViewDaycareService: jasmine.SpyObj<ViewDaycareService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockCookie: jasmine.SpyObj<CookieService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockViewDaycareService = jasmine.createSpyObj('ViewDaycareService', [
      'getDayCareList',
      'onSuspendPlan',
      'activeInactiveDaycare',
    ]);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['encrypt']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'warning', 'error', 'info']);
    mockCookie = jasmine.createSpyObj('CookieService', ['get', 'check']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockCookie.get.and.callFake((key: string) => {
      if (key === 'UserId') return '10';
      if (key === 'UserRoleId') return '1';
      return '';
    });
    mockCookie.check.and.returnValue(true);

    mockViewDaycareService.getDayCareList.and.returnValue(of({
      message: 'Success',
      result: [
        {
          id: 1,
          centreName: 'Sunshine Centre',
          adminInfo: { id: '5' },
          latestPlan: { dueDate: '2026-12-31', isSuspend: false, subscriptionPlanID: 2 },
        },
      ],
      count: 1,
    }));

    await TestBed.configureTestingModule({
      imports: [ViewDaycareComponent],
      providers: [
        ChangeDetectorRef,
        { provide: ViewDaycareService, useValue: mockViewDaycareService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: CommonService, useValue: mockCommonService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: CookieService, useValue: mockCookie },
        { provide: Router, useValue: mockRouter },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ViewDaycareComponent, {
        set: {
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ViewDaycareComponent);
    component = fixture.componentInstance;
  });

  it('should create ViewDaycareComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit and Retrieval', () => {
    it('should read cookies and call getDaycareCenterList', () => {
      component.ngOnInit();

      expect(mockViewDaycareService.getDayCareList).toHaveBeenCalledWith(10, 1, 5, 1, '');
      expect(component.dayCareList.length).toBe(1);
      expect(component.paginationConfig.totalItems).toBe(1);
    });

    it('should handle pagination in filter()', () => {
      spyOn(component, 'getDaycareCenterList');
      component.filter('by-pagination', 2);

      expect(component.paginationConfig.currentPage).toBe(2);
      expect(component.getDaycareCenterList).toHaveBeenCalled();
    });
  });

  describe('Edit and Actions', () => {
    it('should navigate to manage-daycare on onEdit', () => {
      mockCommonService.encrypt.and.callFake((val: string) => 'enc_' + val);
      const mockItem = {
        id: 1,
        adminInfo: { id: '5' },
      };

      component.onEdit(mockItem);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/manage-daycare'], {
        queryParams: {
          enc_id: 'enc_1',
          enc_edit_dcc: 'enc_editDayCare',
          centreAdminID: 'enc_5',
        },
      });
    });

    it('should suspend or unsuspend plan with confirmation', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      mockViewDaycareService.onSuspendPlan.and.returnValue(of({
        message: 'Success',
        activity: 'Plan suspended successfully',
      }));

      component.onSuspendPlan(1, true);
      tick(250);

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(mockViewDaycareService.onSuspendPlan).toHaveBeenCalledWith(1, true);
      expect(mockToastr.success).toHaveBeenCalledWith('Plan suspended successfully');
    }));

    it('should toggle active/inactive daycare centre with confirmation', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      mockViewDaycareService.activeInactiveDaycare.and.returnValue(of({
        message: 'Success',
        activity: 'Centre updated successfully',
      }));

      component.activeInactiveCentre(1, true);
      tick(250);

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(mockViewDaycareService.activeInactiveDaycare).toHaveBeenCalledWith(1);
      expect(mockToastr.success).toHaveBeenCalledWith('Centre updated successfully');
    }));

    it('should check shouldDisablePayment logic', () => {
      const futureDate = '2099-01-01';
      expect(component.shouldDisablePayment(futureDate, false)).toBeTrue();

      const pastDate = '2020-01-01';
      expect(component.shouldDisablePayment(pastDate, false)).toBeFalse();
    });
  });
});
