import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AssignUserPermissionComponent } from './assign-user-permission.component';
import { AssignUserPermissionService } from './assign-user-permission.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReactiveFormsModule } from '@angular/forms';
import { ElementRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

describe('AssignUserPermissionComponent', () => {
  let component: AssignUserPermissionComponent;
  let fixture: ComponentFixture<AssignUserPermissionComponent>;
  let mockService: jasmine.SpyObj<AssignUserPermissionService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('AssignUserPermissionService', [
      'getUserRole',
      'getDayCare',
      'getEmployeeRole',
      'activeInActiveEmployeeStatusByID',
      'EmployeeRole',
      'validateDayCareAssignment',
    ]);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);

    mockService.getUserRole.and.returnValue(
      of({
        message: 'OK',
        result: [
          { id: 6, userRole: 'Counsellor' },
          { id: 9, userRole: 'Educator' },
          { id: 10, userRole: 'Staff' },
          { id: 11, userRole: 'Supervisor' },
          { id: 1, userRole: 'Admin' },
        ],
      })
    );

    mockService.getEmployeeRole.and.returnValue(
      of({
        message: 'OK',
        result: [
          { id: 1, firstName: 'John', lastName: 'Doe', isActive: true },
          { id: 2, firstName: 'Jane', lastName: 'Smith', isActive: false },
        ],
      })
    );

    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal'),
      prop: jasmine.createSpy('prop'),
    });

    await TestBed.configureTestingModule({
      imports: [AssignUserPermissionComponent, ReactiveFormsModule],
      providers: [
        { provide: AssignUserPermissionService, useValue: mockService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: NgxSpinnerService, useValue: mockSpinner },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(AssignUserPermissionComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AssignUserPermissionComponent);
    component = fixture.componentInstance;
    component.formSection = new ElementRef({
      scrollIntoView: jasmine.createSpy('scrollIntoView'),
    });
  });

  it('should create and initialize default properties and form', () => {
    expect(component).toBeTruthy();
    expect(component.assignEmployeeRole).toBeDefined();
    expect(component.statusOptions.length).toBe(2);
    expect(component.currentPage).toBe(1);
    expect(component.itemsPerPage).toBe(5);
  });

  describe('ngOnInit & initial fetch', () => {
    it('should filter user roles [6, 9, 10, 11] and fetch employee roles sorted descending', () => {
      component.ngOnInit();

      expect(mockService.getUserRole).toHaveBeenCalled();
      expect(component.UserRoleList.length).toBe(4);
      expect(mockService.getEmployeeRole).toHaveBeenCalledWith('', '');
      expect(component.EmployeeRoleList[0].id).toBe(2); // descending sort
      expect(component.totalCount).toBe(2);
    });
  });

  describe('getAllDayCare', () => {
    it('should fetch daycare list on Success', () => {
      mockService.getDayCare.and.returnValue(
        of({ message: 'Success', result: [{ id: 1, name: 'Center A' }] })
      );

      component.getAllDayCare('typeA');

      expect(mockService.getDayCare).toHaveBeenCalledWith('typeA');
      expect(component.DayCareList.length).toBe(1);
    });
  });

  describe('filterEmployeeRoles', () => {
    it('should fetch all records when userRoleId is 0 and isActive is null', () => {
      mockService.getEmployeeRole.and.returnValue(
        of([
          { id: 1, firstName: 'A' },
          { id: 2, firstName: 'B' },
        ])
      );

      component.filterEmployeeRoles(0, null);

      expect(mockService.getEmployeeRole).toHaveBeenCalledWith(0, '');
      expect(component.EmployeeRoleList.length).toBe(2);
      expect(component.totalCount).toBe(2);
    });

    it('should fetch filtered records when specific role or status provided', () => {
      mockService.getEmployeeRole.and.returnValue(
        of({
          result: [{ id: 1, firstName: 'A' }],
        })
      );

      component.filterEmployeeRoles(6, true);

      expect(mockService.getEmployeeRole).toHaveBeenCalledWith(6, true);
      expect(component.EmployeeRoleList.length).toBe(1);
    });

    it('should handle error when filtering fails', () => {
      mockService.getEmployeeRole.and.returnValue(throwError(() => new Error('Failed')));

      component.filterEmployeeRoles(6, true);

      expect(component.EmployeeRoleList.length).toBe(0);
      expect(mockToastr.error).toHaveBeenCalledWith('Failed to fetch employee roles.');
    });
  });

  describe('activeInactiveEmployeeStatus', () => {
    it('should toggle employee status when user confirms Swal', fakeAsync(() => {
      component.EmployeeRoleList = [{ id: 5, isActive: true }];
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      mockService.activeInActiveEmployeeStatusByID.and.returnValue(of({ message: 'OK' }));

      component.activeInactiveEmployeeStatus(5, { checked: true });
      tick();

      expect(mockService.activeInActiveEmployeeStatusByID).toHaveBeenCalled();
      expect(component.EmployeeRoleList[0].isActive).toBeFalse();
    }));

    it('should show error when activeInActiveEmployeeStatusByID returns non-OK', fakeAsync(() => {
      component.EmployeeRoleList = [{ id: 5, isActive: true }];
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      mockService.activeInActiveEmployeeStatusByID.and.returnValue(of({ message: 'Error' }));

      component.activeInactiveEmployeeStatus(5, { checked: true });
      tick();

      expect(mockToastr.error).toHaveBeenCalledWith(
        'Failed to update the status. Please try again.',
        'Error'
      );
    }));

    it('should handle cancel confirmation', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: false } as any));

      component.activeInactiveEmployeeStatus(5, { checked: false });
      tick();

      expect(mockService.activeInActiveEmployeeStatusByID).not.toHaveBeenCalled();
    }));
  });

  describe('onRoleChange & removeValidation', () => {
    it('should enable isCounsellorSelected and fetch daycares when Counsellor role chosen', () => {
      spyOn(component, 'getAllDayCare');

      component.onRoleChange({ userRole: 'Counsellor' }, 'type1');

      expect(component.isCounsellorSelected).toBeTrue();
      expect(component.getAllDayCare).toHaveBeenCalledWith('type1');
    });

    it('should clear CentreID validators when non-counsellor role is chosen', () => {
      component.onRoleChange({ userRole: 'Educator' }, 'type1');

      expect(component.isCounsellorSelected).toBeFalse();
    });

    it('removeValidation should reset form and disableMark', () => {
      component.removeValidation();

      expect(component.disableMark).toBeTrue();
    });
  });

  describe('manageEmployeeData', () => {
    it('should mark all touched if form is invalid', () => {
      spyOn(component.assignEmployeeRole, 'markAllAsTouched');
      component.assignEmployeeRole.patchValue({ firstName: '' });

      component.manageEmployeeData();

      expect(component.assignEmployeeRole.markAllAsTouched).toHaveBeenCalled();
    });

    it('should submit successfully when response message is Ok', () => {
      component.assignEmployeeRole.patchValue({
        id: 0,
        firstName: 'Alice',
        email: 'alice@example.com',
        contact: '1234567890',
        UserRoleId: 9,
        CentreID: '',
      });

      mockService.EmployeeRole.and.returnValue(of({ message: 'Ok' }));
      spyOn(component, 'getAllEmployeeRole');

      component.manageEmployeeData();

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(mockService.EmployeeRole).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Submitted data successfully!', 'Success');
      expect(component.getAllEmployeeRole).toHaveBeenCalled();
      expect(mockSpinner.hide).toHaveBeenCalled();
    });

    it('should warn when email already exists', () => {
      component.assignEmployeeRole.patchValue({
        id: 0,
        firstName: 'Alice',
        email: 'alice@example.com',
        contact: '1234567890',
        UserRoleId: 9,
        CentreID: '1',
      });

      mockService.EmployeeRole.and.returnValue(of({ message: 'Email ALready Exists' }));

      component.manageEmployeeData();

      expect(mockToastr.warning).toHaveBeenCalledWith('Email already exists.');
      expect(mockSpinner.hide).toHaveBeenCalled();
    });

    it('should handle error when submission fails', () => {
      component.assignEmployeeRole.patchValue({
        id: 0,
        firstName: 'Alice',
        email: 'alice@example.com',
        contact: '1234567890',
        UserRoleId: 9,
        CentreID: '1',
      });

      mockService.EmployeeRole.and.returnValue(throwError(() => new Error('Server error')));

      component.manageEmployeeData();

      expect(mockToastr.error).toHaveBeenCalledWith(
        'Failed to submit data. Please try again later.',
        'Service Error'
      );
    });
  });

  describe('onEditEmployee', () => {
    it('should patch employee details and configure counsellor validation if role is 6', () => {
      const employee = {
        id: 11,
        firstName: 'Bob',
        lastName: 'Brown',
        email: 'bob@example.com',
        contact: '9876543210',
        userRoleID: 6,
        centreDetails: [{ centreID: 101 }, { centreID: 102 }],
      };

      spyOn(component, 'getAllDayCare');

      component.onEditEmployee(employee, 'editType');

      expect(component.getAllDayCare).toHaveBeenCalledWith('editType');
      expect(component.isCounsellorSelected).toBeTrue();
      expect(component.assignEmployeeRole.value.id).toBe(11);
      expect(component.assignEmployeeRole.value.firstName).toBe('Bob');
      expect(component.assignEmployeeRole.value.CentreID).toEqual([101, 102]);
      expect(component.formSection.nativeElement.scrollIntoView).toHaveBeenCalled();
    });
  });

  describe('onDayCareChange', () => {
    it('should reject already assigned daycare and filter it out', () => {
      component.assignEmployeeRole.patchValue({ CentreID: [10, 20] });
      mockService.validateDayCareAssignment.and.returnValue(of({ message: 'Invalid' }));

      component.onDayCareChange();

      expect(mockService.validateDayCareAssignment).toHaveBeenCalledWith(20);
      expect(component.assignEmployeeRole.value.CentreID).toEqual([10]);
      expect(mockToastr.error).toHaveBeenCalledWith('Daycare already assigned to another counsellor');
    });

    it('should accept valid daycare assignment', () => {
      component.assignEmployeeRole.patchValue({ CentreID: [10, 30] });
      mockService.validateDayCareAssignment.and.returnValue(of({ message: 'Valid' }));

      component.onDayCareChange();

      expect(component.assignEmployeeRole.value.CentreID).toEqual([10, 30]);
    });
  });

  describe('resetAndClose and resetForm', () => {
    it('resetAndClose should close modal and reset form', () => {
      component.resetAndClose();
      expect(component.assignEmployeeRole.value.firstName).toBeNull();
    });

    it('resetForm should reset to default initial state', () => {
      component.resetForm();
      expect(component.assignEmployeeRole.value.id).toBe(0);
      expect(component.assignEmployeeRole.value.firstName).toBe('');
    });

    it('clearUserRoleId should execute without error', () => {
      expect(() => component.clearUserRoleId()).not.toThrow();
    });
  });
});
