import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ViewClassTeacherComponent } from './view-class-teacher.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { ManageClassroomService } from '../day-care-management/classroom-management/manage-classroom/manage-classroom.service';
import { CommonService } from '../common-component/common.service';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';

describe('ViewClassTeacherComponent', () => {
  let component: ViewClassTeacherComponent;
  let fixture: ComponentFixture<ViewClassTeacherComponent>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockClassService: jasmine.SpyObj<ManageClassroomService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {
    mockCookieService = jasmine.createSpyObj('CookieService', ['check', 'get', 'set']);
    mockClassService = jasmine.createSpyObj('ManageClassroomService', [
      'getClassListByDaycareID',
      'getClassTeacher'
    ]);
    mockCommonService = jasmine.createSpyObj('CommonService', ['decrypt', 'encrypt']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error']);

    mockCookieService.check.and.callFake((key: string) => {
      if (key === 'CentreID' || key === 'UserId') return true;
      return false;
    });

    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'CentreID') return '15';
      if (key === 'UserId') return '101';
      if (key === 'UserRoleId') return '4';
      return '';
    });

    mockClassService.getClassListByDaycareID.and.returnValue(of({
      message: 'Success',
      result: [
        { id: 1, className: 'Toddler Class A' },
        { id: 2, className: 'Preschool Room' }
      ]
    }));

    mockClassService.getClassTeacher.and.returnValue(of({
      message: 'OK',
      result: [
        { teacherID: 10, teacherName: 'Miss Sarah', email: 'sarah@test.com' }
      ]
    }));

    await TestBed.configureTestingModule({
      imports: [ViewClassTeacherComponent],
      providers: [
        { provide: CookieService, useValue: mockCookieService },
        { provide: ManageClassroomService, useValue: mockClassService },
        { provide: CommonService, useValue: mockCommonService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: ToastrService, useValue: mockToastr },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of({
              get: (key: string) => null
            })
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(ViewClassTeacherComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewClassTeacherComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit and Param Extraction', () => {
    it('should read centreID from cookie and call getAllClasses', () => {
      spyOn(component, 'getAllClasses').and.callThrough();

      component.ngOnInit();

      expect(component.centreID).toBe(15);
      expect(component.loginUserID).toBe(101);
      expect(component.UserRoleID).toBe(4);
      expect(component.getAllClasses).toHaveBeenCalled();
      expect(component.classList.length).toBe(2);
    });

    it('should decrypt enc_id from query params if present', () => {
      const route = TestBed.inject(ActivatedRoute);
      (route as any).queryParamMap = of({
        get: (key: string) => key === 'enc_id' ? 'encrypted_25' : null
      });
      mockCommonService.decrypt.and.returnValue('25');
      spyOn(component, 'getAllClasses');

      component.ngOnInit();

      expect(mockCommonService.decrypt).toHaveBeenCalledWith('encrypted_25');
      expect(component.centreID).toBe(25);
      expect(component.getAllClasses).toHaveBeenCalled();
    });
  });

  describe('Banner and Class Operations', () => {
    it('should close banner on closeBanner', () => {
      expect(component.showBanner).toBeTrue();
      component.closeBanner();
      expect(component.showBanner).toBeFalse();
    });

    it('should fetch teacher list when onClassNameClick is called', () => {
      spyOn(component, 'getTeacherByClass').and.callThrough();

      component.centreID = 15;
      component.onClassNameClick(1);

      expect(component.classSelected).toBe(1);
      expect(component.getTeacherByClass).toHaveBeenCalled();
      expect(mockClassService.getClassTeacher).toHaveBeenCalledWith(15, 1);
      expect(component.teacherlist.length).toBe(1);
      expect(component.skeletonShow2).toBe('');
    });

    it('should emit item through dataFromChild EventEmitter on onEdit', () => {
      spyOn(component.dataFromChild, 'emit');
      const mockItem = { id: 1, className: 'Toddler Class A' };

      component.onEdit(mockItem);

      expect(component.dataFromChild.emit).toHaveBeenCalledWith(mockItem);
    });

    it('should debounce class search on onSearchInput', fakeAsync(() => {
      spyOn(component, 'getAllClasses');

      component.onSearchInput();
      expect(component.getAllClasses).not.toHaveBeenCalled();

      tick(1500);
      expect(component.getAllClasses).toHaveBeenCalledTimes(1);
    }));

    it('should handle empty class list on non-Success message in getAllClasses', () => {
      mockClassService.getClassListByDaycareID.and.returnValue(of({
        message: 'No Classes'
      }));

      component.getAllClasses();

      expect(component.classList).toEqual([]);
      expect(component.skeletonShow).toBe('');
    });
  });
});
