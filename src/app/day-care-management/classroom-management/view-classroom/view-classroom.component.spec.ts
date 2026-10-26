import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewClassroomComponent } from './view-classroom.component';
import { CookieService } from 'ngx-cookie-service';
import { ManageClassroomService } from '../manage-classroom/manage-classroom.service';
import { CommonService } from '../../../common-component/common.service';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError, BehaviorSubject } from 'rxjs';

describe('ViewClassroomComponent', () => {
  let component: ViewClassroomComponent;
  let fixture: ComponentFixture<ViewClassroomComponent>;

  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockClassService: jasmine.SpyObj<ManageClassroomService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let queryParamMapSubject: BehaviorSubject<any>;

  beforeEach(async () => {
    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'check']);
    mockClassService = jasmine.createSpyObj('ManageClassroomService', [
      'getClassListByDaycareID',
      'getSectionByClassID',
    ]);
    mockCommonService = jasmine.createSpyObj('CommonService', ['decrypt']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate'], { url: '/manage-classroom' });
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    queryParamMapSubject = new BehaviorSubject(convertToParamMap({}));

    mockCookieService.check.and.returnValue(true);
    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'CentreID') return '10';
      if (key === 'UserId') return '5';
      if (key === 'UserRoleId') return '2';
      return '';
    });

    mockClassService.getClassListByDaycareID.and.returnValue(
      of({
        message: 'Success',
        result: [
          { id: 1, className: 'Toddlers' },
          { id: 2, className: 'Infants' },
        ],
      })
    );
    mockClassService.getSectionByClassID.and.returnValue(
      of({
        message: 'OK',
        result: [{ id: 101, sectionName: 'Section A' }],
      })
    );

    await TestBed.configureTestingModule({
      imports: [ViewClassroomComponent],
      providers: [
        { provide: CookieService, useValue: mockCookieService },
        { provide: ManageClassroomService, useValue: mockClassService },
        { provide: CommonService, useValue: mockCommonService },
        { provide: Router, useValue: mockRouter },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: queryParamMapSubject.asObservable(),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ViewClassroomComponent, {
        set: {
          imports: [],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ViewClassroomComponent);
    component = fixture.componentInstance;
  });

  it('should create ViewClassroomComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit & Class Fetching', () => {
    it('should initialize centreID and user roles from cookies and call getAllClasses', () => {
      component.ngOnInit();
      expect(component.centreID).toBe(10);
      expect(component.UserRoleID).toBe(2);
      expect(mockClassService.getClassListByDaycareID).toHaveBeenCalledWith(10, 2, 5, '');
      expect(component.classList.length).toBe(2);
      expect(component.skeletonShow).toBe('');
    });

    it('should decrypt enc_id query param if present', () => {
      mockCommonService.decrypt.and.returnValue('20');
      queryParamMapSubject.next(convertToParamMap({ enc_id: 'enc123' }));

      component.ngOnInit();
      expect(component.centreID).toBe(20);
    });

    it('should set classList to empty array if response message is not Success', () => {
      mockClassService.getClassListByDaycareID.and.returnValue(of({ message: 'Error', result: [] }));
      component.getAllClasses();
      expect(component.classList).toEqual([]);
      expect(component.skeletonShow).toBe('');
    });
  });

  describe('Section and Edit Actions', () => {
    it('should fetch sections on onClassNameClick', async () => {
      await component.onClassNameClick(1);
      expect(mockClassService.getSectionByClassID).toHaveBeenCalledWith(1);
      expect(component.sectionlist.length).toBe(1);
      expect(component.sectionlist[0].sectionName).toBe('Section A');
    });

    it('should handle error in onClassNameClick gracefully', async () => {
      mockClassService.getSectionByClassID.and.returnValue(throwError(() => new Error('Error')));
      spyOn(console, 'error');

      await component.onClassNameClick(1);

      expect(console.error).toHaveBeenCalled();
      expect(component.skeletonShow2).toBe('');
    });

    it('should emit dataFromChild and navigate to /manage-classroom onEdit', async () => {
      spyOn(component.dataFromChild, 'emit');
      const item = { id: 1, className: 'Toddlers' };

      await component.onEdit(item);

      expect(component.dataFromChild.emit).toHaveBeenCalledWith(jasmine.objectContaining({ id: 1 }));
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/manage-classroom']);
    });

    it('should navigate to /onboarding if url includes onboarding', async () => {
      (mockRouter as any).url = '/onboarding/step-2';
      const item = { id: 1, className: 'Toddlers' };

      await component.onEdit(item);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/onboarding']);
    });

    it('should navigate to /manage-announcements onQuickAnnouncement', () => {
      component.onQuickAnnouncement({ id: 5 });
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/manage-announcements'], {
        queryParams: { newAnnouncement: 'true', classId: 5 },
      });
    });
  });

  describe('Search Filter', () => {
    it('should filter classList according to searchText', () => {
      component.classList = [
        { id: 1, className: 'Toddlers' },
        { id: 2, className: 'Infants' },
        { id: 3, className: 'Preschool' },
      ];

      component.searchText = 'todd';
      expect(component.filteredClssList.length).toBe(1);
      expect(component.filteredClssList[0].className).toBe('Toddlers');

      component.searchText = '';
      expect(component.filteredClssList.length).toBe(3);
    });
  });
});
