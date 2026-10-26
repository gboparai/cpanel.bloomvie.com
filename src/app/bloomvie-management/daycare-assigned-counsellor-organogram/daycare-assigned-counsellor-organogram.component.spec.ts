import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { DaycareAssignedCounsellorOrganogramComponent } from './daycare-assigned-counsellor-organogram.component';
import { AssignUserPermissionService } from '../../settings/Permission/assign-user-permission/assign-user-permission.service';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../common-component/common.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { CookieService } from 'ngx-cookie-service';

describe('DaycareAssignedCounsellorOrganogramComponent', () => {
  let component: DaycareAssignedCounsellorOrganogramComponent;
  let fixture: ComponentFixture<DaycareAssignedCounsellorOrganogramComponent>;

  let assignUserPermissionServiceSpy: jasmine.SpyObj<AssignUserPermissionService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let commonServiceSpy: jasmine.SpyObj<CommonService>;
  let spinnerSpy: jasmine.SpyObj<NgxSpinnerService>;
  let cookieServiceSpy: jasmine.SpyObj<CookieService>;

  beforeEach(async () => {
    assignUserPermissionServiceSpy = jasmine.createSpyObj('AssignUserPermissionService', [
      'getassignedDcc',
    ]);
    toastrSpy = jasmine.createSpyObj('ToastrService', ['error', 'success', 'warning', 'info']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    commonServiceSpy = jasmine.createSpyObj('CommonService', ['decrypt', 'convertS3File']);
    spinnerSpy = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    cookieServiceSpy = jasmine.createSpyObj('CookieService', ['get']);

    commonServiceSpy.decrypt.and.callFake((val: string) => (val === 'enc-123' ? '123' : ''));
    commonServiceSpy.convertS3File.and.callFake((path: string) => `s3://${path}`);

    assignUserPermissionServiceSpy.getassignedDcc.and.returnValue(
      of({
        result: {
          counsellor: {
            counsellorFirstName: 'Jane',
            counsellorMiddleName: 'A.',
            counsellorLastName: 'Doe',
            profilePhoto: 'photo.jpg',
          },
          dcCs: [
            {
              dcCname: 'Happy Kids',
              dccEmail: 'happy@kids.com',
              ownerName: 'Alice',
              profilePhoto: 'dcc.jpg',
            },
          ],
        },
      })
    );

    await TestBed.configureTestingModule({
      imports: [DaycareAssignedCounsellorOrganogramComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ id: 'enc-123' }),
          },
        },
        { provide: AssignUserPermissionService, useValue: assignUserPermissionServiceSpy },
        { provide: ToastrService, useValue: toastrSpy },
        { provide: Router, useValue: routerSpy },
        { provide: CommonService, useValue: commonServiceSpy },
        { provide: NgxSpinnerService, useValue: spinnerSpy },
        { provide: CookieService, useValue: cookieServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DaycareAssignedCounsellorOrganogramComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize when UserRoleId is 6 (counsellor role)', fakeAsync(() => {
      cookieServiceSpy.get.and.callFake((key: string) => {
        if (key === 'UserRoleId') return '6';
        if (key === 'UserId') return '789';
        return '';
      });

      spyOn(component, 'GetCounsellor');

      component.ngOnInit();
      tick();

      expect(component.id).toBe('789');
      expect(component.GetCounsellor).toHaveBeenCalled();
    }));

    it('should initialize via queryParams when UserRoleId is not 6', fakeAsync(() => {
      cookieServiceSpy.get.and.callFake((key: string) => {
        if (key === 'UserRoleId') return '1';
        return '';
      });

      spyOn(component, 'GetCounsellor');

      component.ngOnInit();
      tick();

      expect(commonServiceSpy.decrypt).toHaveBeenCalledWith('enc-123');
      expect(component.id).toBe('123');
      expect(component.GetCounsellor).toHaveBeenCalled();
    }));
  });

  describe('GetCounsellor', () => {
    it('should fetch counsellor details, format names, and transform s3 URLs', async () => {
      component.id = '123';

      await component.GetCounsellor();

      expect(assignUserPermissionServiceSpy.getassignedDcc).toHaveBeenCalledWith(123);
      expect(component.Counsellor.fullName).toBe('Jane A. Doe');
      expect(component.Counsellor.profilePhoto).toBe('s3://photo.jpg');
      expect(component.Dcc.length).toBe(1);
      expect(component.Dcc[0].profilePhoto).toBe('s3://dcc.jpg');
      expect(component.skeletonShow).toBe('');
    });

    it('should handle error gracefully and set skeletonShow to NoRecord', async () => {
      component.id = '999';
      assignUserPermissionServiceSpy.getassignedDcc.and.returnValue(
        throwError(() => new Error('Not found'))
      );
      spyOn(console, 'error');

      await component.GetCounsellor();

      expect(component.skeletonShow).toBe('NoRecord');
      expect(component.Dcc).toEqual([]);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('filtering and pagination', () => {
    beforeEach(() => {
      component.Dcc = [
        { dcCname: 'Sunshine Daycare', dccEmail: 'sun@day.com', ownerName: 'Alice' },
        { dcCname: 'Rainbow Academy', dccEmail: 'rain@bow.com', ownerName: 'Bob' },
      ];
    });

    it('should return all DCCs when searchText is empty in displayedDcc', () => {
      component.searchText = '';
      expect(component.displayedDcc.length).toBe(2);
    });

    it('should filter DCCs by dcCname, email, or ownerName when searchText is given', () => {
      component.searchText = 'sunshine';
      component.applyFilter();

      expect(component.filteredDcc.length).toBe(1);
      expect(component.filteredDcc[0].dcCname).toBe('Sunshine Daycare');
      expect(component.displayedDcc.length).toBe(1);
      expect(component.ContentP).toBe(1);
    });

    it('should update ContentP on onPageChange', () => {
      component.onPageChange(3);
      expect(component.ContentP).toBe(3);
    });
  });

  it('should navigate back to /daycare-assignment-counsellor on goBack', () => {
    component.goBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/daycare-assignment-counsellor']);
  });
});
