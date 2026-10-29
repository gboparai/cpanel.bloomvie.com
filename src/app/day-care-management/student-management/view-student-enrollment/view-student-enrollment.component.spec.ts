import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewStudentEnrollmentComponent } from './view-student-enrollment.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ViewStudentEnrollmentService } from './view-student-enrollment.service';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

describe('ViewStudentEnrollmentComponent', () => {
  let component: ViewStudentEnrollmentComponent;
  let fixture: ComponentFixture<ViewStudentEnrollmentComponent>;
  let mockViewStudentService: jasmine.SpyObj<ViewStudentEnrollmentService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockCookie: jasmine.SpyObj<CookieService>;

  beforeEach(async () => {
    mockViewStudentService = jasmine.createSpyObj('ViewStudentEnrollmentService', [
      'getClassList',
      'studentClassAssignment',
      'getStudent',
      'getStudentParentDetailsByStudentID',
    ]);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'warning', 'error', 'info']);
    mockCookie = jasmine.createSpyObj('CookieService', ['get', 'check']);

    mockCookie.get.and.returnValue('10');
    mockViewStudentService.getStudent.and.returnValue(of({
      message: 'Success',
      result: [
        { studentID: 1, studentFirstName: 'Tommy', studentLastName: 'Shelby', classID: null, studentAgeGroup: 'Toddler' },
      ],
    }));

    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal'),
    });

    await TestBed.configureTestingModule({
      imports: [ViewStudentEnrollmentComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: ViewStudentEnrollmentService, useValue: mockViewStudentService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: CookieService, useValue: mockCookie },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ViewStudentEnrollmentComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ViewStudentEnrollmentComponent);
    component = fixture.componentInstance;
  });

  it('should create ViewStudentEnrollmentComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization and ngOnInit', () => {
    it('should load student list for centre in ngOnInit', () => {
      component.ngOnInit();

      expect(component.daycareID).toBe(10);
      expect(mockViewStudentService.getStudent).toHaveBeenCalledWith(10, true);
      expect(component.Students.length).toBe(1);
    });

    it('should stop showing the skeleton when the enrollment request fails', () => {
      mockViewStudentService.getStudent.and.returnValue(
        throwError(() => new Error('Network failure')),
      );

      component.getStudentDetails(10);

      expect(component.skeletonShow).toBe('Error');
      expect(component.Students).toEqual([]);
      expect(mockToastr.error).toHaveBeenCalledWith('Network failure');
    });

    it('should show an error state when the API returns a failure response', () => {
      mockViewStudentService.getStudent.and.returnValue(
        of({ message: 'Request failed', result: null }),
      );

      component.getStudentDetails(10);

      expect(component.skeletonShow).toBe('Error');
      expect(component.Students).toEqual([]);
      expect(mockToastr.error).toHaveBeenCalledWith('Request failed');
    });

    it('should show the empty state when the API returns no enrollment records', () => {
      mockViewStudentService.getStudent.and.returnValue(
        of({ message: 'Success', result: [] }),
      );

      component.getStudentDetails(10);

      expect(component.skeletonShow).toBe('NoRecord');
      expect(component.Students).toEqual([]);
    });

    it('should remove assigned students from the enrollment list after refresh', () => {
      mockViewStudentService.getStudent.and.returnValues(
        of({
          message: 'Success',
          result: [{ studentID: 5, classID: null }],
        }),
        of({
          message: 'Success',
          result: [{ studentID: 5, ClassID: 12 }],
        }),
      );
      mockViewStudentService.studentClassAssignment.and.returnValue(
        of({ message: 'Success' }),
      );
      component.daycareID = 10;
      component.assignClassForm.patchValue({ studentID: 5, classID: 12 });

      component.getStudentDetails(10);
      expect(component.Students.length).toBe(1);

      component.onSubmit();

      expect(mockViewStudentService.getStudent).toHaveBeenCalledTimes(2);
      expect(component.Students).toEqual([]);
      expect(component.skeletonShow).toBe('NoRecord');
    });

    it('should not submit an assignment without a selected class', () => {
      component.assignClassForm.patchValue({ studentID: 5, classID: null });

      component.onSubmit();

      expect(mockViewStudentService.studentClassAssignment).not.toHaveBeenCalled();
    });
  });

  describe('Form and Assignment', () => {
    it('should patch form and fetch classes on setDefaultValue', () => {
      mockViewStudentService.getClassList.and.returnValue(of({
        result: [{ id: 1, name: 'Toddler Room' }],
      }));

      const mockStudent = {
        studentID: 5,
        studentFirstName: 'Anna',
        studentLastName: 'Bell',
        studentAgeGroup: 'Infant',
        studentAgeGroupID: 2,
      };

      component.setDefaultValue(mockStudent);

      expect(component.assignClassForm.value.studentID).toBe(5);
      expect(component.assignClassForm.value.studentName).toBe('Anna Bell');
      expect(mockViewStudentService.getClassList).toHaveBeenCalledWith(10, 2);
      expect(component.classList).toEqual([{ id: 1, name: 'Toddler Room' }]);
    });

    it('should submit class assignment successfully', () => {
      component.daycareID = 10;
      component.assignClassForm.patchValue({
        studentID: 5,
        classID: 1,
      });

      mockViewStudentService.studentClassAssignment.and.returnValue(of({
        message: 'Success',
      }));
      spyOn(component, 'getStudentDetails');

      component.onSubmit();

      expect(mockViewStudentService.studentClassAssignment).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Class Assigned Successfully !', 'Success');
      expect(component.getStudentDetails).toHaveBeenCalledWith(10);
    });

    it('should handle error when class assignment fails', () => {
      component.assignClassForm.patchValue({
        studentID: 5,
        classID: 1,
      });

      mockViewStudentService.studentClassAssignment.and.returnValue(of({
        message: 'Failed',
      }));

      component.onSubmit();

      expect(mockToastr.error).toHaveBeenCalled();
    });

    it('should reset dropdowns on resetDropdown()', () => {
      component.classList = [{ id: 1 }];
      component.sectionList = [{ id: 2 }];
      component.selectedSection = 2;

      component.resetDropdown();

      expect(component.classList).toEqual([]);
      expect(component.sectionList).toEqual([]);
      expect(component.selectedSection).toBeNull();
    });

    it('should update section ID on onSectionAdd', () => {
      component.onSectionAdd({ sectionID: 8 });
      expect(component.sectionID).toBe(8);
    });

    it('should fetch student parent details in getStudentParentDetailsByStudentID', () => {
      mockViewStudentService.getStudentParentDetailsByStudentID.and.returnValue(of({
        message: 'Success',
        result: [{ fatherName: 'Arthur' }],
      }));

      component.getStudentParentDetailsByStudentID(5);

      expect(mockViewStudentService.getStudentParentDetailsByStudentID).toHaveBeenCalledWith(5);
      expect(component.StudentParentDetail).toEqual({ fatherName: 'Arthur' });
    });

    it('should update page number in onPageChange', () => {
      component.onPageChange(3);
      expect(component.ContentP).toBe(3);
    });
  });
});
