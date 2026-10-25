import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentAdditionalInformationComponent } from './student-additional-information.component';
import { ClassroomDetailsService } from '../../../classroom-management/classroom-details/classroom-details.service';
import { ActivatedRoute } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import * as CryptoJS from 'crypto-js';

describe('StudentAdditionalInformationComponent', () => {
  let component: StudentAdditionalInformationComponent;
  let fixture: ComponentFixture<StudentAdditionalInformationComponent>;
  let mockClassroomService: jasmine.SpyObj<ClassroomDetailsService>;

  const secretKey = 'encrypt001100!?';
  const encrypted = CryptoJS.AES.encrypt('77', secretKey).toString();

  beforeEach(async () => {
    mockClassroomService = jasmine.createSpyObj('ClassroomDetailsService', ['getChildDailyRoutine']);

    mockClassroomService.getChildDailyRoutine.and.returnValue(of({
      message: 'OK',
      result: [
        { sectionID: 1, sectionName: 'Dietary', labelName: 'Allergies', answer: 'Peanuts' },
        { sectionID: 1, sectionName: 'Dietary', labelName: 'Diet', answer: 'Vegetarian' },
        { sectionID: 2, sectionName: 'Sleep', labelName: 'Nap time', answer: '1:00 PM' },
      ],
    }));

    await TestBed.configureTestingModule({
      imports: [StudentAdditionalInformationComponent],
      providers: [
        { provide: ClassroomDetailsService, useValue: mockClassroomService },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ ID: encrypted }),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(StudentAdditionalInformationComponent, {
        set: {
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(StudentAdditionalInformationComponent);
    component = fixture.componentInstance;
  });

  it('should create StudentAdditionalInformationComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit and Routine grouping', () => {
    it('should decrypt student ID and fetch daily routine', () => {
      component.ngOnInit();

      expect(component.studentID).toBe(77);
      expect(component.SelectedStudentId).toBe(77);
      expect(mockClassroomService.getChildDailyRoutine).toHaveBeenCalledWith(77);
      expect(component.item.length).toBe(2);
      expect(component.item[0].sectionName).toBe('Dietary');
      expect(component.item[0].labels.length).toBe(2);
      expect(component.item[1].sectionName).toBe('Sleep');
    });

    it('should handle error when fetching daily routine fails', () => {
      mockClassroomService.getChildDailyRoutine.and.returnValue(throwError(() => new Error('Fetch error')));
      spyOn(console, 'error');

      component.studentID = 77;
      component.getChildDailyRoutine();

      expect(console.error).toHaveBeenCalled();
    });
  });
});
