import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentProfileComponent } from './student-profile.component';
import { ClassroomDetailsService } from '../../classroom-management/classroom-details/classroom-details.service';
import { CommonService } from '../../../common-component/common.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import * as CryptoJS from 'crypto-js';

describe('StudentProfileComponent', () => {
  let component: StudentProfileComponent;
  let fixture: ComponentFixture<StudentProfileComponent>;
  let mockClassroomService: jasmine.SpyObj<ClassroomDetailsService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;

  beforeEach(async () => {
    mockClassroomService = jasmine.createSpyObj('ClassroomDetailsService', ['getStudentProfileByStudentID']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['convertS3File']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);

    mockClassroomService.getStudentProfileByStudentID.and.returnValue(of({
      message: 'OK',
      result: {
        id: 42,
        firstName: 'Emma',
        lastName: 'Watson',
        studentProfilePhoto: 's3/path/photo.png',
      },
    }));
    mockCommonService.convertS3File.and.callFake((path: string) => 'converted/' + path);

    const secretKey = 'encrypt001100!?';
    const encrypted = CryptoJS.AES.encrypt('42', secretKey).toString();

    await TestBed.configureTestingModule({
      imports: [StudentProfileComponent],
      providers: [
        DatePipe,
        { provide: ClassroomDetailsService, useValue: mockClassroomService },
        { provide: CommonService, useValue: mockCommonService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({
              ID: encrypted,
              TYPE: 'active',
            }),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(StudentProfileComponent, {
        set: {
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(StudentProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create StudentProfileComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit and Profile Fetch', () => {
    it('should decrypt student ID from queryParams and fetch profile', () => {
      component.ngOnInit();

      expect(component.studentID).toBe(42);
      expect(component.SelectedStudentId).toBe(42);
      expect(component.type).toBe('active');
      expect(mockSpinner.show).toHaveBeenCalled();
      expect(mockClassroomService.getStudentProfileByStudentID).toHaveBeenCalledWith(42);
      expect(component.data.firstName).toBe('Emma');
      expect(component.data.studentProfilePhoto).toBe('converted/s3/path/photo.png');
      expect(mockSpinner.hide).toHaveBeenCalled();
    });

    it('should hide spinner if studentID is not defined', () => {
      component.studentID = 0;
      component.getStudentProfileByStudentID();

      expect(mockSpinner.hide).toHaveBeenCalled();
    });
  });
});
