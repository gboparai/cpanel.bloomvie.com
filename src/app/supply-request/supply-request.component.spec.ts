import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SupplyRequestComponent } from './supply-request.component';
import { FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { SuuplyService } from './suuply.service';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

describe('SupplyRequestComponent', () => {
  let component: SupplyRequestComponent;
  let fixture: ComponentFixture<SupplyRequestComponent>;
  let mockSupplyService: jasmine.SpyObj<SuuplyService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;

  beforeEach(async () => {
    mockSupplyService = jasmine.createSpyObj('SuuplyService', [
      'getSupplyRequestById',
      'DeleteSupply',
      'manageSuuplyRequest',
      'getSupplyRequestByLoginId'
    ]);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'warning', 'error', 'info']);
    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'set']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);

    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'UserId') return '101';
      if (key === 'CentreID') return '5';
      return '';
    });

    mockSupplyService.getSupplyRequestByLoginId.and.returnValue(of({
      message: 'OK',
      result: [
        { id: 1, itemName: 'Crayons', quantity: 20, itemDescription: 'Colored crayons', reason: 'Old batch damaged' }
      ]
    }));

    await TestBed.configureTestingModule({
      imports: [SupplyRequestComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: SuuplyService, useValue: mockSupplyService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: CookieService, useValue: mockCookieService },
        { provide: NgxSpinnerService, useValue: mockSpinner }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(SupplyRequestComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplyRequestComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
    expect(component.SupplyForm).toBeDefined();
    expect(component.referralLinks.length).toBe(1);
  });

  describe('ngOnInit', () => {
    it('should initialize user IDs and call getSupplyList when UserId > 0', () => {
      spyOn(component, 'getSupplyList').and.callThrough();

      component.ngOnInit();

      expect(component.UserId).toBe('101');
      expect(component.loginUserId).toBe('101');
      expect(component.centreID).toBe('5');
      expect(component.getSupplyList).toHaveBeenCalled();
      expect(component.SupplyList.length).toBe(1);
    });
  });

  describe('Referral Links Array Methods', () => {
    it('should add referral link to FormArray', () => {
      component.addReferralLink();
      expect(component.referralLinks.length).toBe(2);
    });

    it('should remove referral link by index', () => {
      component.addReferralLink();
      expect(component.referralLinks.length).toBe(2);

      component.removeReferralLink(0);
      expect(component.referralLinks.length).toBe(1);
    });

    it('should retrieve array of referral values', () => {
      component.referralLinks.at(0).setValue('https://amazon.ca/link1');
      expect(component.getReferralValues()).toEqual(['https://amazon.ca/link1']);
    });
  });

  describe('Pagination & Viewing', () => {
    it('should update ContentP on onPageChange', () => {
      component.onPageChange(3);
      expect(component.ContentP).toBe(3);
    });

    it('should display deletion reason with Swal on onView', () => {
      spyOn(Swal, 'fire');
      component.SupplyList = [
        { id: 1, itemName: 'Paper', reason: 'Out of stock' }
      ];

      component.onView(1);

      expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
        title: 'Reason for Deletion',
        text: 'Out of stock',
        icon: 'info'
      }));
    });
  });

  describe('OnEdit', () => {
    it('should fetch supply request by id and patch form', () => {
      mockSupplyService.getSupplyRequestById.and.returnValue(of({
        message: 'OK',
        result: {
          id: 5,
          itemName: 'Paint Brushes',
          quantity: 10,
          itemDescription: 'Acrylic brushes',
          referralLinks: 'http://link1.com, http://link2.com'
        }
      }));

      component.OnEdit(5);

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(mockSupplyService.getSupplyRequestById).toHaveBeenCalledWith(5);
      expect(component.SupplyForm.value.id).toBe(5);
      expect(component.SupplyForm.value.itemName).toBe('Paint Brushes');
      expect(component.referralLinks.length).toBe(2);
      expect(component.showReferralInput).toBeTrue();
      expect(mockSpinner.hide).toHaveBeenCalled();
    });
  });

  describe('OnSubmitSupply', () => {
    it('should create new supply when id is 0', () => {
      component.SupplyForm.patchValue({
        id: 0,
        itemName: 'Glue Sticks',
        quantity: 5,
        itemDescription: 'Craft glue'
      });
      mockSupplyService.manageSuuplyRequest.and.returnValue(of({
        message: 'Supply Added Successfully'
      }));
      spyOn(component, 'getSupplyList');

      component.OnSubmitSupply();

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(mockSupplyService.manageSuuplyRequest).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Supply Added Successfully');
      expect(component.getSupplyList).toHaveBeenCalled();
      expect(mockSpinner.hide).toHaveBeenCalled();
    });

    it('should update supply when id > 0', () => {
      component.SupplyForm.patchValue({
        id: 10,
        itemName: 'Safety Scissors',
        quantity: 15,
        itemDescription: 'Blunt tip'
      });
      mockSupplyService.manageSuuplyRequest.and.returnValue(of({
        message: 'Supply Updated Successfully'
      }));
      spyOn(component, 'getSupplyList');

      component.OnSubmitSupply();

      expect(mockToastr.success).toHaveBeenCalledWith('Supply Updated Successfully');
      expect(component.getSupplyList).toHaveBeenCalled();
    });

    it('should mark all controls as touched if form is invalid', () => {
      component.SupplyForm.patchValue({
        itemName: '' // required
      });
      spyOn(component.SupplyForm, 'markAllAsTouched');

      component.OnSubmitSupply();

      expect(component.SupplyForm.markAllAsTouched).toHaveBeenCalled();
      expect(mockSpinner.hide).toHaveBeenCalled();
    });

    it('should handle API error gracefully', () => {
      component.SupplyForm.patchValue({
        id: 0,
        itemName: 'Paper Rolls',
        quantity: 2
      });
      mockSupplyService.manageSuuplyRequest.and.returnValue(throwError(() => new Error('Server error')));

      component.OnSubmitSupply();

      expect(mockToastr.error).toHaveBeenCalledWith('An error occurred while processing the request');
      expect(mockSpinner.hide).toHaveBeenCalled();
    });
  });

  describe('onDelete', () => {
    it('should delete supply after confirmation and reason input', fakeAsync(() => {
      const swalSpy = spyOn(Swal, 'fire');
      swalSpy.and.returnValues(
        Promise.resolve({ isConfirmed: true } as any),
        Promise.resolve({ isConfirmed: true, value: 'No longer needed' } as any),
        Promise.resolve({} as any)
      );

      mockSupplyService.DeleteSupply.and.returnValue(of({
        message: 'Supply deleted successfully'
      }));
      spyOn(component, 'getSupplyList');

      component.onDelete(5);
      tick();

      expect(mockSupplyService.DeleteSupply).toHaveBeenCalledWith(5, 'No longer needed');
      expect(component.getSupplyList).toHaveBeenCalled();
    }));
  });

  describe('Reset and Cancel', () => {
    it('should reset SupplyForm on resetForm', () => {
      component.SupplyForm.patchValue({ itemName: 'Pens', quantity: 50 });
      component.resetForm();

      expect(component.SupplyForm.value.itemName).toBeNull();
      expect(component.SupplyForm.value.id).toBe(0);
      expect(component.SupplyForm.value.statusID).toBe(3);
    });
  });
});
