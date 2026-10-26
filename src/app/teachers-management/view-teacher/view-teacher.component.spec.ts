import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { ViewTeacherComponent } from './view-teacher.component';
import { CookieService } from 'ngx-cookie-service';
import { ViewTeacherService } from './view-teacher.service';
import { NgxSpinnerService } from 'ngx-spinner';

describe('ViewTeacherComponent', () => {
  let component: ViewTeacherComponent;
  let fixture: ComponentFixture<ViewTeacherComponent>;

  let mockCookie: jasmine.SpyObj<CookieService>;
  let mockTeacherService: jasmine.SpyObj<ViewTeacherService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;

  beforeEach(async () => {
    mockCookie = jasmine.createSpyObj('CookieService', ['get']);
    mockTeacherService = jasmine.createSpyObj('ViewTeacherService', [
      'getAttendingTeachersInfo',
      'getTeacherDetailByStudentParentId'
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);

    mockCookie.get.and.callFake((key: string) => {
      if (key === 'UserId') return '12';
      if (key === 'UserRoleId') return '5';
      if (key === 'StudentID') return '34';
      return '';
    });

    mockTeacherService.getTeacherDetailByStudentParentId.and.returnValue(
      of({
        message: 'OK',
        result: [{ teacherId: 1, name: 'Miss Mary', subject: 'Kindergarten' }]
      })
    );
    mockTeacherService.getAttendingTeachersInfo.and.returnValue(
      of({
        message: 'OK',
        result: [{ teacherId: 2, name: 'Mr. Smith' }]
      })
    );

    await TestBed.configureTestingModule({
      imports: [ViewTeacherComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: CookieService, useValue: mockCookie },
        { provide: ViewTeacherService, useValue: mockTeacherService },
        { provide: Router, useValue: mockRouter },
        { provide: NgxSpinnerService, useValue: mockSpinner }
      ]
    })
    .overrideComponent(ViewTeacherComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewTeacherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component and initialize cookies', () => {
    expect(component).toBeTruthy();
    expect(component.loginUserId).toBe('12');
    expect(component.userRoleId).toBe('5');
    expect(component.studentID).toBe('34');
    expect(mockTeacherService.getTeacherDetailByStudentParentId).toHaveBeenCalledWith(12, 34);
    expect(component.TeacherList.length).toBe(1);
    expect(mockSpinner.hide).toHaveBeenCalled();
  });

  it('should handle non-OK response in getTeacherDetailByStudentParentId', () => {
    mockTeacherService.getTeacherDetailByStudentParentId.and.returnValue(
      of({ message: 'Error', result: null })
    );

    component.getTeacherDetailByStudentParentId();

    expect(component.TeacherList).toEqual([]);
    expect(mockSpinner.hide).toHaveBeenCalled();
  });

  it('should fetch teacher detail via getTeacherDetail and handle OK response', () => {
    component.getTeacherDetail(12);

    expect(mockTeacherService.getAttendingTeachersInfo).toHaveBeenCalledWith(1, 2, 1);
    expect(component.teacherDetailslList.length).toBe(1);
  });

  it('should handle non-OK response in getTeacherDetail', () => {
    mockTeacherService.getAttendingTeachersInfo.and.returnValue(
      of({ message: 'Fail', result: [] })
    );

    component.getTeacherDetail(12);

    expect(component.teacherDetailslList).toEqual([]);
  });

  it('should update ContentP on onPageChange', () => {
    component.onPageChange(3);
    expect(component.ContentP).toBe(3);
  });
});
