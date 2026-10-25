import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClassroomDetailsComponent } from './classroom-details.component';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ClassroomDetailsService } from './classroom-details.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

describe('ClassroomDetailsComponent', () => {
  let component: ClassroomDetailsComponent;
  let fixture: ComponentFixture<ClassroomDetailsComponent>;

  let mockRouter: jasmine.SpyObj<Router>;
  let mockClassroomService: jasmine.SpyObj<ClassroomDetailsService>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockClassroomService = jasmine.createSpyObj('ClassroomDetailsService', [
      'getClassRoom',
      'getStudentByClassID',
    ]);
    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'check']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);

    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'CentreID') return '10';
      if (key === 'UserId') return '3';
      if (key === 'UserRoleId') return '2';
      return '';
    });

    mockClassroomService.getClassRoom.and.returnValue(
      of({
        message: 'OK',
        result: [
          { classroomID: 101, className: 'Toddler Room' },
          { classroomID: 102, className: 'Preschool Room' },
        ],
      })
    );
    mockClassroomService.getStudentByClassID.and.returnValue(
      of({
        message: 'Success',
        result: [
          { id: 1, name: 'Alice', selected: false },
          { id: 2, name: 'Bob', selected: false },
        ],
      })
    );

    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal'),
    });

    await TestBed.configureTestingModule({
      imports: [ClassroomDetailsComponent, ReactiveFormsModule, FormsModule],
      providers: [
        FormBuilder,
        { provide: Router, useValue: mockRouter },
        { provide: ClassroomDetailsService, useValue: mockClassroomService },
        { provide: CookieService, useValue: mockCookieService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ClassroomDetailsComponent, {
        set: {
          imports: [ReactiveFormsModule, FormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ClassroomDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create ClassroomDetailsComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should read cookies and call getClassRoom', async () => {
      component.ngOnInit();
      expect(component.daycareID).toBe('10');
      expect(component.teacherID).toBe(3);
      expect(component.UserRoleId).toBe('2');
      expect(mockClassroomService.getClassRoom).toHaveBeenCalledWith('10', 3, '2');
    });

    it('should auto-select classroom if only one classroom returned', async () => {
      mockClassroomService.getClassRoom.and.returnValue(
        of({
          message: 'OK',
          result: [{ classroomID: 99, className: 'Only Room' }],
        })
      );
      spyOn(component, 'onSelectClass');

      await component.getClassRoom();

      expect(component.ClassAndSectionForm.get('classroomID')?.value).toBe(99);
      expect(component.onSelectClass).toHaveBeenCalled();
    });

    it('should handle getClassRoom error gracefully', async () => {
      mockClassroomService.getClassRoom.and.returnValue(throwError(() => new Error('Server error')));
      spyOn(console, 'error');

      await component.getClassRoom();

      expect(mockSpinner.hide).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Search & Selection', () => {
    it('should trigger getStudentByClassID on search when query > 3 chars or empty', () => {
      spyOn(component, 'getStudentByClassID');

      component.onSearchName({ target: { value: 'Johnny' } });
      expect(component.name).toBe('Johnny');
      expect(component.getStudentByClassID).toHaveBeenCalled();

      component.onSearchName({ target: { value: '' } });
      expect(component.getStudentByClassID).toHaveBeenCalledTimes(2);

      component.onSearchName({ target: { value: 'ab' } });
      expect(component.getStudentByClassID).toHaveBeenCalledTimes(2);
    });

    it('should set classId and fetch students onSelectClass', () => {
      spyOn(component, 'getStudentByClassID');
      component.ClassAndSectionForm.patchValue({ classroomID: '101' });

      component.onSelectClass({ classroomID: 101 });

      expect(component.classId).toBe(101);
      expect(component.getStudentByClassID).toHaveBeenCalled();
    });

    it('should clear student list if classroomID is empty in onSelectClass', () => {
      component.StudentList = [{ id: 1 }];
      component.ClassAndSectionForm.patchValue({ classroomID: '' });

      component.onSelectClass({ classroomID: 101 });

      expect(component.StudentList.length).toBe(0);
    });

    it('should fetch students by class ID successfully', async () => {
      component.daycareID = '10';
      component.classId = 101;
      component.name = 'Alice';

      await component.getStudentByClassID();

      expect(mockClassroomService.getStudentByClassID).toHaveBeenCalledWith('10', 101, 'Alice');
      expect(component.StudentList.length).toBe(2);
      expect(mockSpinner.hide).toHaveBeenCalled();
    });

    it('should handle getStudentByClassID error gracefully', async () => {
      mockClassroomService.getStudentByClassID.and.returnValue(throwError(() => new Error('Error')));
      spyOn(console, 'error');

      await component.getStudentByClassID();

      expect(mockSpinner.hide).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Selection toggles & helper functions', () => {
    it('should return isDisable true when no students selected', () => {
      component.SelectedStudentId = [];
      expect(component.isDisable()).toBeTrue();

      component.SelectedStudentId = [1];
      expect(component.isDisable()).toBeFalse();
    });

    it('should add and remove student ID with onSelectInput', () => {
      component.StudentList = [{ id: 1, selected: true }, { id: 2, selected: false }];
      component.SelectedStudentId = [];

      component.onSelectInput(1, true);
      expect(component.SelectedStudentId).toContain(1);

      component.onSelectInput(1, false);
      expect(component.SelectedStudentId).not.toContain(1);
    });

    it('should select all and deselect all with onSelectAllChange', () => {
      component.StudentList = [{ id: 1, selected: false }, { id: 2, selected: false }];
      component.selectAll = true;

      component.onSelectAllChange();

      expect(component.StudentList.every((s) => s.selected)).toBeTrue();
      expect(component.SelectedStudentId).toEqual([1, 2]);

      component.selectAll = false;
      component.onSelectAllChange();
      expect(component.StudentList.every((s) => !s.selected)).toBeTrue();
      expect(component.SelectedStudentId).toEqual([]);
    });

    it('should format time string correctly to AM/PM', () => {
      expect(component.formatTime('09:30')).toBe('09:30 AM');
      expect(component.formatTime('14:45')).toBe('02:45 PM');
      expect(component.formatTime('')).toBe('');
    });

    it('should pad zero correctly', () => {
      expect(component.padZero(5)).toBe('05');
      expect(component.padZero(11)).toBe('11');
    });

    it('should open and close modal correctly', () => {
      component.modalOpen(1);
      expect(component.MasterActivityID).toBe(1);
      expect(component.popupOpen).toBeTrue();
      expect((window as any).$).toHaveBeenCalledWith('#addingStudentActivityModal');

      component.modalClose({});
      expect(component.popupOpen).toBeFalse();
    });

    it('should navigate to view-student-detail with encrypted ID on selectClassRoom', () => {
      component.selectClassRoom(105);
      expect(component.SelectedStudentId.includes(105)).toBeTrue();
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/view-student-detail'],
        jasmine.objectContaining({
          queryParams: jasmine.objectContaining({ TYPE: 'detail' }),
        })
      );
    });
  });
});
