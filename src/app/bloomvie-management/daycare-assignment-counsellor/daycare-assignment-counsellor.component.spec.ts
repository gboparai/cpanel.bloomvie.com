import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { DaycareAssignmentCounsellorComponent } from './daycare-assignment-counsellor.component';
import { AssignUserPermissionService } from '../../settings/Permission/assign-user-permission/assign-user-permission.service';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../common-component/common.service';
import { NgxSpinnerService } from 'ngx-spinner';

describe('DaycareAssignmentCounsellorComponent', () => {
  let component: DaycareAssignmentCounsellorComponent;
  let fixture: ComponentFixture<DaycareAssignmentCounsellorComponent>;

  let assignUserPermissionServiceSpy: jasmine.SpyObj<AssignUserPermissionService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let commonServiceSpy: jasmine.SpyObj<CommonService>;
  let spinnerSpy: jasmine.SpyObj<NgxSpinnerService>;

  beforeEach(async () => {
    assignUserPermissionServiceSpy = jasmine.createSpyObj('AssignUserPermissionService', [
      'getEmployeeRole',
    ]);
    toastrSpy = jasmine.createSpyObj('ToastrService', ['error', 'success', 'warning', 'info']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    commonServiceSpy = jasmine.createSpyObj('CommonService', ['convertS3File', 'encrypt']);
    spinnerSpy = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);

    commonServiceSpy.convertS3File.and.callFake((path: string) => `s3://${path}`);
    commonServiceSpy.encrypt.and.callFake((val: string) => `enc-${val}`);

    assignUserPermissionServiceSpy.getEmployeeRole.and.returnValue(
      of({
        result: [
          { id: 1, name: 'Counsellor 1', s3ImageUrl: 'c1.png' },
          { id: 2, name: 'Counsellor 2', s3ImageUrl: '' },
        ],
      })
    );

    await TestBed.configureTestingModule({
      imports: [DaycareAssignmentCounsellorComponent],
      providers: [
        { provide: AssignUserPermissionService, useValue: assignUserPermissionServiceSpy },
        { provide: ToastrService, useValue: toastrSpy },
        { provide: Router, useValue: routerSpy },
        { provide: CommonService, useValue: commonServiceSpy },
        { provide: NgxSpinnerService, useValue: spinnerSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DaycareAssignmentCounsellorComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
    expect(component.showBanner).toBe(true);
  });

  it('should load counsellors on ngOnInit', async () => {
    spyOn(component, 'GetCounsellor').and.callThrough();

    await component.ngOnInit();

    expect(component.GetCounsellor).toHaveBeenCalled();
    expect(assignUserPermissionServiceSpy.getEmployeeRole).toHaveBeenCalledWith(6, true);
    expect(component.EmployeeRoleList.length).toBe(2);
    expect(component.EmployeeRoleList[0].S3Url).toBe('s3://c1.png');
    expect(component.EmployeeRoleList[1].S3Url).toBe('');
    expect(component.totalCount).toBe(2);
    expect(component.skeletonShow).toBe('');
  });

  it('should handle error when fetching counsellors fails', async () => {
    assignUserPermissionServiceSpy.getEmployeeRole.and.returnValue(
      throwError(() => new Error('API failure'))
    );
    spyOn(console, 'error');

    await component.GetCounsellor();

    expect(component.EmployeeRoleList).toEqual([]);
    expect(component.totalCount).toBe(0);
    expect(toastrSpy.error).toHaveBeenCalledWith('Failed to fetch employee roles.');
    expect(component.skeletonShow).toBe('');
  });

  it('should close banner on closeBanner()', () => {
    component.closeBanner();
    expect(component.showBanner).toBe(false);
  });

  it('should encrypt id and navigate in DayCareOrganogram(id)', () => {
    component.DayCareOrganogram(42);

    expect(commonServiceSpy.encrypt).toHaveBeenCalledWith('42');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/daycare-assigned-counsellor-organogram'], {
      queryParams: { id: 'enc-42' },
    });
  });
});
