import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ViewSupplyRequestComponent } from './view-supply-request.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { SuuplyService } from '../supply-request/suuply.service';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { CommonService } from '../common-component/common.service';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

describe('ViewSupplyRequestComponent', () => {
  let component: ViewSupplyRequestComponent;
  let fixture: ComponentFixture<ViewSupplyRequestComponent>;
  let mockSupplyService: jasmine.SpyObj<SuuplyService>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let modalSpy: jasmine.Spy;

  beforeEach(async () => {
    mockSupplyService = jasmine.createSpyObj('SuuplyService', [
      'getSuuplyRequest',
      'approveOrRejectSupplyRequest',
      'manageSuuplyRequest',
      'getAllExpenseTypes',
      'reviewSupplyRequest'
    ]);
    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'set']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'warning', 'error', 'info']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    (mockRouter as any).url = '/view-supply-request';

    mockCommonService = jasmine.createSpyObj('CommonService', ['uploadImages', 'blobToFile']);

    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'UserId') return '101';
      if (key === 'CentreID') return '10';
      return '';
    });

    mockSupplyService.getSuuplyRequest.and.returnValue(of({
      message: 'Success',
      result: [
        {
          teacherName: 'Sarah Connor',
          appliedOn: '2025-01-01',
          items: [
            { id: 1, itemName: 'Notebooks', quantity: 15, statusId: 3 }
          ]
        }
      ]
    }));

    mockSupplyService.getAllExpenseTypes.and.returnValue(of({
      message: 'Success',
      result: [
        { id: 1, name: 'Supplies' },
        { id: 2, name: 'Equipment' }
      ]
    }));

    modalSpy = jasmine.createSpy('modal');
    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: modalSpy,
      val: jasmine.createSpy('val'),
    });

    await TestBed.configureTestingModule({
      imports: [ViewSupplyRequestComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: SuuplyService, useValue: mockSupplyService },
        { provide: CookieService, useValue: mockCookieService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: Router, useValue: mockRouter },
        { provide: CommonService, useValue: mockCommonService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(ViewSupplyRequestComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewSupplyRequestComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
    expect(component.SupplyForm).toBeDefined();
    expect(component.purchasedForm).toBeDefined();
  });

  describe('ngOnInit', () => {
    it('should initialize UserId and centreID and call getSupplyList and getAllExpenseTypes', async () => {
      spyOn(component, 'getSupplyList').and.callThrough();
      spyOn(component, 'getAllExpenseTypes').and.callThrough();

      component.ngOnInit();

      expect(component.UserId).toBe('101');
      expect(component.centreID).toBe(10);
      expect(component.activeRoute).toBe('/view-supply-request');
      expect(component.getSupplyList).toHaveBeenCalledWith('pending');
      expect(component.getAllExpenseTypes).toHaveBeenCalled();
    });
  });

  describe('getSupplyList & Filtering', () => {
    it('should fetch supply requests and populate SupplyList', async () => {
      await component.getSupplyList('pending');

      expect(mockSupplyService.getSuuplyRequest).toHaveBeenCalledWith('101', 'pending');
      expect(component.SupplyList.length).toBe(1);
      expect(component.filteredSupplyList.length).toBe(1);
      expect(component.HideActionButton).toBeFalse();
    });

    it('should set HideActionButton to true when status is accepted', async () => {
      await component.getSupplyList('accepted');
      expect(component.HideActionButton).toBeTrue();
    });

    it('should filter supplies by teacher name or item name in applyFilter', () => {
      component.SupplyList = [
        {
          teacherName: 'Alice Smith',
          items: [{ id: 1, itemName: 'Paper' }]
        },
        {
          teacherName: 'Bob Jones',
          items: [{ id: 2, itemName: 'Clay' }]
        }
      ];

      component.searchText = 'Alice';
      component.applyFilter();
      expect(component.displayedSupplyList.length).toBe(1);
      expect(component.displayedSupplyList[0].teacherName).toBe('Alice Smith');

      component.searchText = 'Clay';
      component.applyFilter();
      expect(component.displayedSupplyList.length).toBe(1);
      expect(component.displayedSupplyList[0].teacherName).toBe('Bob Jones');

      component.searchText = '';
      expect(component.displayedSupplyList.length).toBe(2);
    });
  });

  describe('Approve & Reject Modal Actions', () => {
    it('should open approve modal in openApproveModal', () => {
      component.openApproveModal({ id: 99 });
      expect(component.selectedItemId).toBe(99);
      expect((window as any).$).toHaveBeenCalledWith('#modalOpen');
      expect(modalSpy).toHaveBeenCalledWith('show');
    });

    it('should approve supply item and refresh list', () => {
      mockSupplyService.approveOrRejectSupplyRequest.and.returnValue(of({
        message: 'Item Approved'
      }));
      spyOn(component, 'getSupplyList');

      component.approveSupply(1, 99);

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(mockSupplyService.approveOrRejectSupplyRequest).toHaveBeenCalledWith(1, 99, '101');
      expect(mockToastr.success).toHaveBeenCalledWith('Item Approved');
      expect(modalSpy).toHaveBeenCalledWith('hide');
      expect(component.getSupplyList).toHaveBeenCalledWith('pending');
    });

    it('should show rejection warning on item rejected', () => {
      mockSupplyService.approveOrRejectSupplyRequest.and.returnValue(of({
        message: 'Item Rejected'
      }));
      spyOn(component, 'getSupplyList');

      component.approveSupply(2, 99);

      expect(mockToastr.error).toHaveBeenCalledWith('Item has been rejected');
      expect(component.getSupplyList).toHaveBeenCalledWith('pending');
    });

    it('should handle onReject with Swal confirmation', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      spyOn(component, 'approveSupply');

      component.onReject(99);
      tick();

      expect(component.approveSupply).toHaveBeenCalledWith(2, 99);
    }));

    it('should open purchased modal on onAccept', () => {
      const item = { id: 10, userRoleID: 2 };
      component.onAccept(item);

      expect(component.selectedItemId).toBe(10);
      expect((window as any).$).toHaveBeenCalledWith('#purchased');
      expect(modalSpy).toHaveBeenCalledWith('show');
    });
  });

  describe('Form Submissions', () => {
    it('should submit SupplyForm on onSubmit', () => {
      component.SupplyForm.patchValue({
        id: 0,
        itemName: 'Markers',
        quantity: 10
      });

      mockSupplyService.manageSuuplyRequest.and.returnValue(of({
        message: 'Supply Added Successfully'
      }));
      spyOn(component, 'getSupplyList');

      component.onSubmit();

      expect(mockSupplyService.manageSuuplyRequest).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Supply Added Successfully');
      expect(component.getSupplyList).toHaveBeenCalledWith('pending');
    });

    it('should review and approve purchase in purchaseItemSubmit', () => {
      component.selectedItemId = 55;
      component.purchasedForm.patchValue({
        expenseType: 1,
        cost: 25.50,
        quantity: 5
      });

      mockSupplyService.reviewSupplyRequest.and.returnValue(of({
        message: 'Success'
      }));
      spyOn(component, 'getSupplyList');

      component.purchaseItemSubmit();

      expect(mockSupplyService.reviewSupplyRequest).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Item approved successfully.');
      expect(component.getSupplyList).toHaveBeenCalledWith('pending');
      expect(modalSpy).toHaveBeenCalledWith('hide');
    });
  });

  describe('Image Cropping and File Uploads', () => {
    it('should open cropper modal on FileSelectionBeforeCrop', () => {
      const event = {
        target: {
          files: [new File(['dummy'], 'receipt.jpg', { type: 'image/jpeg' })]
        }
      };

      component.FileSelectionBeforeCrop(event);

      expect(component.fileName).toBe('receipt.jpg');
      expect((window as any).$).toHaveBeenCalledWith('#cropperModal');
      expect(modalSpy).toHaveBeenCalledWith('show');
    });

    it('should store blob on storeTempCrop', () => {
      const dummyBlob = new Blob(['data'], { type: 'image/jpeg' });
      component.storeTempCrop({ blob: dummyBlob } as any);

      expect(component.tempCroppedEvent).toBe(dummyBlob);
    });

    it('should upload cropped image and enable submit on fileChangeHandler', async () => {
      const dummyFile = new File(['data'], 'receipt.jpg', { type: 'image/jpeg' });
      mockCommonService.blobToFile.and.returnValue(dummyFile);
      mockCommonService.uploadImages.and.returnValue(of({
        message: 'OK',
        result: [{ imageName: 'receipt_saved.jpg', path: 'http://s3/receipt.jpg' }]
      }));

      await component.fileChangeHandler('CapitolExpenses');

      expect(component.isSubmitDisabled).toBeFalse();
      expect(modalSpy).toHaveBeenCalledWith('hide');
    });
  });
});
