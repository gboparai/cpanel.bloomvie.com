import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormControl } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { ChildRoutineComponent } from './child-routine.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { ChildRoutineService } from './child-routine.service';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { DaycareQuestionnaireService } from '../../../daycare-questionnaire/daycare-questionnaire.service';
import { CommonService } from '../../../common-component/common.service';
import Swal from 'sweetalert2';

describe('ChildRoutineComponent', () => {
  let component: ChildRoutineComponent;
  let fixture: ComponentFixture<ChildRoutineComponent>;

  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockRoutineService: jasmine.SpyObj<ChildRoutineService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockCookie: jasmine.SpyObj<CookieService>;
  let mockCustomService: jasmine.SpyObj<DaycareQuestionnaireService>;
  let mockCommonService: any;

  beforeEach(async () => {
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockRoutineService = jasmine.createSpyObj('ChildRoutineService', [
      'getStudentLikesAndDislikes',
      'getSectionByCentreID',
      'SubmitSection',
      'submitCombinedData',
      'getAllPendingOnboardingStudentByCentreIDAndParentID',
      'GetControlAndLabelForm',
      'SubmitControlFieldAnswers'
    ]);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'info']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockCookie = jasmine.createSpyObj('CookieService', ['get', 'set', 'delete']);
    mockCustomService = jasmine.createSpyObj('DaycareQuestionnaireService', ['CopyIsMasterTrueSections']);

    mockCookie.get.and.callFake((key: string) => {
      if (key === 'UserRoleId') return '5';
      if (key === 'UserId') return '101';
      if (key === 'StudentID') return '501';
      if (key === 'CentreID') return '10';
      if (key === 'UserInfo') {
        return JSON.stringify({ result: { centreID: 10 } });
      }
      return '';
    });

    mockCustomService.CopyIsMasterTrueSections.and.returnValue(of({ message: 'Success' }));
    mockRoutineService.getSectionByCentreID.and.returnValue(
      of({ message: 'Success', result: [{ id: 1, sectionName: 'General' }] })
    );
    mockRoutineService.getStudentLikesAndDislikes.and.returnValue(
      of({ message: 'Success', result: [{ answers: [{ controlLabelName: 'favoriteToy', answer: 'Blocks' }] }] })
    );
    mockRoutineService.GetControlAndLabelForm.and.returnValue(
      of({
        result: [
          {
            id: 1,
            label: 'Favorite Toy',
            controlType: 'text',
            sectionID: 1
          }
        ]
      })
    );
    mockRoutineService.SubmitSection.and.returnValue(
      of({ message: 'Success' })
    );
    mockRoutineService.submitCombinedData.and.returnValue(
      of({ message: 'Success' })
    );
    mockRoutineService.SubmitControlFieldAnswers.and.returnValue(
      of({ message: 'Success' })
    );

    mockCommonService = {
      loadStep2: signal(false),
      encrypt: jasmine.createSpy('encrypt').and.callFake((val: any) => `enc_${val}`)
    };

    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal')
    });

    await TestBed.configureTestingModule({
      imports: [ChildRoutineComponent, ReactiveFormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: ChildRoutineService, useValue: mockRoutineService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: Router, useValue: mockRouter },
        { provide: CookieService, useValue: mockCookie },
        { provide: DaycareQuestionnaireService, useValue: mockCustomService },
        { provide: CommonService, useValue: mockCommonService },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({})
          }
        }
      ]
    })
    .overrideComponent(ChildRoutineComponent, {
      set: { imports: [ReactiveFormsModule], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChildRoutineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component and initialize forms', () => {
    expect(component).toBeTruthy();
    expect(component.dailyRoutineForm).toBeDefined();
    expect(component.AddSectionForm).toBeDefined();
    expect(component.LabelAndControlForm).toBeDefined();
    expect(component.studentID).toBe(501);
    expect(component.login).toBe(101);
  });

  describe('Validators and Helper Methods', () => {
    it('should validate requiredNotOnlySpaces validator', () => {
      const validator = component.requiredNotOnlySpaces();
      const controlNull = new FormControl(null);
      const controlSpaces = new FormControl('   ');
      const controlValid = new FormControl('Nap routine');

      expect(validator(controlNull)).toBeNull();
      expect(validator(controlSpaces)).toEqual({ required: true });
      expect(validator(controlValid)).toBeNull();
    });

    it('should verify areFieldsFilled', () => {
      component.LabelAndControlForm.patchValue({
        LabelName: 'Meal Preference',
        ControlType: 'select',
        Position: 1
      });
      expect(component.areFieldsFilled()).toBeTrue();

      component.LabelAndControlForm.patchValue({ LabelName: '   ' });
      expect(component.areFieldsFilled()).toBeFalse();
    });

    it('should reset LabelAndControlForm in ResetForm and open modal', () => {
      component.ResetForm();
      expect(component.LabelAndControlForm.get('LabelName')?.value).toBe('');
      expect((window as any).$).toHaveBeenCalledWith('#Custom-form');
    });

    it('should open section modal on OpenSectionModal', () => {
      component.OpenSectionModal();
      expect((window as any).$).toHaveBeenCalledWith('#addSectionModal');
    });

    it('should select student from list', () => {
      component.selectStudentFromList({ studentID: 77 });
      expect(component.selectStudent).toEqual({ studentID: 77 });

      component.selectStudentFromList(null);
      expect(component.selectStudent).toBeNull();
    });
  });

  describe('Control Type and Default Value Mapping', () => {
    it('should map control types correctly', () => {
      expect(component.mapControlType('text')).toBe('textbox');
      expect(component.mapControlType('number')).toBe('number');
      expect(component.mapControlType('select')).toBe('select');
      expect(component.mapControlType('checkbox')).toBe('checkbox');
      expect(component.mapControlType('radio')).toBe('radio');
      expect(component.mapControlType('date')).toBe('date');
      expect(component.mapControlType('datetime')).toBe('datetime');
      expect(component.mapControlType('time')).toBe('time');
      expect(component.mapControlType('textarea')).toBe('textarea');
      expect(component.mapControlType('unknown')).toBe('textbox');
    });

    it('should map default values correctly', () => {
      expect(component.mapDefaultValue('text')).toBe('');
      expect(component.mapDefaultValue('number')).toBeNull();
      expect(component.mapDefaultValue('checkbox')).toBeFalse();
      expect(component.mapDefaultValue('radio')).toBeNull();
      expect(component.mapDefaultValue('select')).toBeNull();
      expect(component.mapDefaultValue('textarea')).toBe('');
      expect(component.mapDefaultValue('unknown')).toBe('');
    });
  });

  describe('Section and Question Submissions', () => {
    it('should submit section form successfully', () => {
      component.CentreID = 10;
      component.AddSectionForm.patchValue({ SectionTitle: 'Habits' });

      component.onSubmitSectionForm();

      expect(mockRoutineService.SubmitSection).toHaveBeenCalledWith({
        centreID: 10,
        SectionName: 'Habits'
      });
      expect(mockToastr.success).toHaveBeenCalledWith('Section Added Successfully');
    });

    it('should handle "Section Already Exists" message', () => {
      mockRoutineService.SubmitSection.and.returnValue(
        of({ message: 'Section Already Exists' })
      );
      component.AddSectionForm.patchValue({ SectionTitle: 'General' });

      component.onSubmitSectionForm();

      expect(mockToastr.info).toHaveBeenCalledWith('Section Already Exists');
    });

    it('should submit dynamic form answers via onSubmitDynamicForm', () => {
      component.fields = [{ id: 1, name: 'favoriteToy' }];
      component.myControlForm.addControl('favoriteToy', new FormControl('Lego'));

      component.onSubmitDynamicForm();

      expect(mockRoutineService.SubmitControlFieldAnswers).toHaveBeenCalledWith([
        { controlLabelId: 1, value: ['Lego'] }
      ]);
      expect(mockToastr.success).toHaveBeenCalledWith('Data submitted successfully');
    });
  });

  describe('Main Form Submission', () => {
    it('should show error if dailyRoutineForm is invalid', () => {
      component.dailyRoutineForm.reset();
      component.onSubmit();

      expect(mockToastr.error).toHaveBeenCalledWith('Please fill all required fields in the main form');
      expect(mockRoutineService.submitCombinedData).not.toHaveBeenCalled();
    });

    it('should submit combined data when dailyRoutineForm is valid in updateCase', fakeAsync(() => {
      component.dailyRoutineForm.patchValue({
        preferredNapTime: '13:00',
        specificSleepNeeds: 'Quiet room'
      });
      component.updateCase = true;
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));

      component.onSubmit();
      tick();

      expect(mockRoutineService.submitCombinedData).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Data submitted successfully');
    }));

    it('should navigate to next kid onboarding via startAnotherKidOnboarding', () => {
      component.selectStudent = { studentID: 88, orderNumber: 'ORD-88', token: 'token123' };
      component.startAnotherKidOnboarding();

      expect(mockCookie.set).toHaveBeenCalledWith('StudentID', 88 as any);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/welcome'], jasmine.any(Object));
    });

    it('should manage checkbox selection state via checkBoxStateManager', () => {
      component.answersOfControlRecord = [
        [
          { controlType: 'checkbox', answer: 'Milk,Juice' }
        ]
      ];

      expect(component.checkBoxStateManager('Milk', 'drink')).toBeTrue();
      expect(component.checkBoxStateManager('Soda', 'drink')).toBeFalse();
    });

    it('should retrieve answer by field name with getAnswerByFieldName', () => {
      component.answersOfControlRecord = [
        [{ controlLabelName: 'favoriteToy', answer: 'Blocks' }]
      ];

      expect(component.getAnswerByFieldName('favoriteToy')).toBe('Blocks');
      expect(component.getAnswerByFieldName('unknown')).toBeNull();
    });
  });
});
