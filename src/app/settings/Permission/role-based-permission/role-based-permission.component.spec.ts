import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RoleBasedPermissionComponent } from './role-based-permission.component';
import { UserRoleService } from '../user-role/user-role.service';
import { UserPermissionService } from '../user-permission/user-permission.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { CookieService } from 'ngx-cookie-service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import Swal from 'sweetalert2';

describe('RoleBasedPermissionComponent', () => {
  let component: RoleBasedPermissionComponent;
  let fixture: ComponentFixture<RoleBasedPermissionComponent>;
  let mockUserRoleService: jasmine.SpyObj<UserRoleService>;
  let mockUserPermissionService: jasmine.SpyObj<UserPermissionService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockCookie: jasmine.SpyObj<CookieService>;

  beforeEach(async () => {
    mockUserRoleService = jasmine.createSpyObj('UserRoleService', ['getAllUserRoles']);
    mockUserPermissionService = jasmine.createSpyObj('UserPermissionService', [
      'assignPermissionToRole',
      'getUserRolePermissionByUserRoleID',
    ]);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockCookie = jasmine.createSpyObj('CookieService', ['get']);

    mockCookie.get.and.returnValue('10');

    mockUserRoleService.getAllUserRoles.and.returnValue(
      of({
        message: 'OK',
        result: [
          { id: 1, userRole: 'Admin', isActive: true },
          { id: 2, userRole: 'InactiveRole', isActive: false },
        ],
      })
    );

    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      prop: jasmine.createSpy('prop'),
    });

    await TestBed.configureTestingModule({
      imports: [RoleBasedPermissionComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: UserRoleService, useValue: mockUserRoleService },
        { provide: UserPermissionService, useValue: mockUserPermissionService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: CookieService, useValue: mockCookie },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(RoleBasedPermissionComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(RoleBasedPermissionComponent);
    component = fixture.componentInstance;
  });

  it('should create and initialize default values', () => {
    expect(component).toBeTruthy();
    expect(component.RolePermissionForm).toBeDefined();
    expect(component.isManuPresent).toBeFalse();
    expect(component.isAllSelected).toBeFalse();
    expect(component.input).toBe(component.RolePermissionForm.controls);
  });

  describe('ngOnInit & getUserRole', () => {
    it('should read UserID cookie and fetch active user roles', () => {
      component.ngOnInit();

      expect(component.UserID).toBe('10');
      expect(mockUserRoleService.getAllUserRoles).toHaveBeenCalled();
      expect(component.userRoleList.length).toBe(1);
      expect(component.userRoleList[0].id).toBe(1);
    });
  });

  describe('AssignConfirmation & AssignPermission', () => {
    it('should warn with Swal if UserRoleID is empty string in AssignConfirmation', () => {
      spyOn(Swal, 'fire');
      component.UserRoleID = '';

      component.AssignConfirmation();

      expect(Swal.fire).toHaveBeenCalledWith(
        jasmine.objectContaining({ icon: 'warning', text: 'Please select role.' })
      );
    });

    it('should show confirmation Swal and call AssignPermission when form is valid', fakeAsync(() => {
      component.UserRoleID = 3;
      component.RolePermissionForm.patchValue({ UserRoleID: 3 });

      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      spyOn(component, 'AssignPermission');

      component.AssignConfirmation();
      tick();

      expect(component.AssignPermission).toHaveBeenCalled();
    }));

    it('AssignPermission should call service and handle ok message', () => {
      component.UserRoleID = 3;
      component.data = { ParentChildchecklist: [{ id: 1, isSelected: true }] };

      mockUserPermissionService.assignPermissionToRole.and.returnValue(
        of({ message: 'ok' })
      );
      spyOn(Swal, 'fire');
      spyOn(component, 'BindUserTypePermission');

      component.AssignPermission();

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(mockUserPermissionService.assignPermissionToRole).toHaveBeenCalledWith(
        3,
        component.data.ParentChildchecklist
      );
      expect(mockSpinner.hide).toHaveBeenCalled();
      expect(component.BindUserTypePermission).toHaveBeenCalledWith('');
    });

    it('AssignPermission should show warning Swal if response message is not ok', () => {
      component.UserRoleID = 3;
      component.data = { ParentChildchecklist: [] };

      mockUserPermissionService.assignPermissionToRole.and.returnValue(
        of({ message: 'Error assigning' })
      );
      spyOn(Swal, 'fire');

      component.AssignPermission();

      expect(Swal.fire).toHaveBeenCalledWith(
        jasmine.objectContaining({ icon: 'warning', text: 'Error assigning' })
      );
    });
  });

  describe('Reset & treeview', () => {
    it('Reset should reset form and set isManuPresent false', () => {
      component.isManuPresent = true;
      component.Reset();

      expect(component.isManuPresent).toBeFalse();
    });

    it('treeview should populate data and set isManuPresent true', () => {
      const mockList = [{ id: 1, isSelected: true }, { id: 2, isSelected: false }];
      component.treeview(mockList);

      expect(component.data.ParentChildchecklist).toBe(mockList);
      expect(component.isManuPresent).toBeTrue();
    });
  });

  describe('BindUserTypePermission', () => {
    it('should fetch role permission and update treeview when role object is passed', () => {
      mockUserPermissionService.getUserRolePermissionByUserRoleID.and.returnValue(
        of({
          message: 'ok',
          result: [
            {
              id: 1,
              isSelected: true,
              childList: [{ id: 10, isSelected: true, nestedchildList: [] }],
            },
          ],
        })
      );

      component.BindUserTypePermission({ id: 5 });

      expect(component.UserRoleID).toBe(5);
      expect(mockUserPermissionService.getUserRolePermissionByUserRoleID).toHaveBeenCalledWith(5);
      expect(component.isManuPresent).toBeTrue();
    });

    it('should set isManuPresent false if undefined passed', () => {
      component.BindUserTypePermission(undefined);
      expect(component.isManuPresent).toBeFalse();
    });
  });

  describe('hierarchical checks: parentCheck, childCheck, nestedchildCheck, selectAll', () => {
    it('parentCheck should toggle all children and nested children to match parent', () => {
      const parent = {
        isSelected: true,
        IsCustomized: false,
        childList: [
          {
            isSelected: false,
            IsCustomized: false,
            nestedchildList: [{ isSelected: false, IsCustomized: false }],
          },
        ],
      };

      component.parentCheck(parent);

      expect(parent.IsCustomized).toBeTrue();
      expect(parent.childList[0].isSelected).toBeTrue();
      expect(parent.childList[0].nestedchildList[0].isSelected).toBeTrue();
    });

    it('childCheck should update parent isSelected based on children', () => {
      const parent: any = { isSelected: false, IsCustomized: false };
      const children = [
        { id: 10, isSelected: true, IsCustomized: false, nestedchildList: [] },
        { id: 11, isSelected: false, IsCustomized: false, nestedchildList: [] },
      ];

      component.childCheck(parent, children, 10);

      expect(parent.isSelected).toBeTrue();
      expect(children[0].IsCustomized).toBeTrue();
    });

    it('nestedchildCheck should update parent isSelected based on children', () => {
      const parent: any = { isSelected: false, IsCustomized: false };
      const children = [
        { id: 20, isSelected: true, IsCustomized: false, nestedchildList: [] },
      ];

      component.nestedchildCheck(parent, children, 20);

      expect(parent.isSelected).toBeTrue();
    });

    it('toggleSelectAll should set selection state for entire hierarchy', () => {
      component.data = {
        ParentChildchecklist: [
          {
            isSelected: false,
            childList: [
              {
                isSelected: false,
                nestedchildList: [{ isSelected: false }],
              },
            ],
          },
        ],
      };

      component.toggleSelectAll({ target: { checked: true } });

      expect(component.isAllSelected).toBeTrue();
      expect(component.data.ParentChildchecklist[0].isSelected).toBeTrue();
      expect(component.data.ParentChildchecklist[0].childList[0].isSelected).toBeTrue();
      expect(component.data.ParentChildchecklist[0].childList[0].nestedchildList[0].isSelected).toBeTrue();
    });

    it('updateSelectAllStatus should evaluate to true when all items are selected', () => {
      component.data = {
        ParentChildchecklist: [
          {
            isSelected: true,
            childList: [
              {
                isSelected: true,
                nestedchildList: [{ isSelected: true }],
              },
            ],
          },
        ],
      };

      component.updateSelectAllStatus();

      expect(component.isAllSelected).toBeTrue();
    });
  });
});
