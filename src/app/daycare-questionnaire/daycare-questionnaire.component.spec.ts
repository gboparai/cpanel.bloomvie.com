import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DaycareQuestionnaireComponent } from './daycare-questionnaire.component';
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { DaycareQuestionnaireService } from './daycare-questionnaire.service';
import { ChildRoutineService } from '../parent-management/parent-onboarding/child-routine/child-routine.service';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';

describe('DaycareQuestionnaireComponent', () => {
  let component: DaycareQuestionnaireComponent;
  let fixture: ComponentFixture<DaycareQuestionnaireComponent>;
  let mockCustomService: any;
  let mockChildRoutineService: jasmine.SpyObj<ChildRoutineService>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let modalSpy: jasmine.Spy;

  beforeEach(async () => {
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'info', 'error']);
    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'set']);
    mockChildRoutineService = jasmine.createSpyObj('ChildRoutineService', ['GetControlAndLabelForm']);

    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'UserId') return '101';
      if (key === 'UserRoleId') return '4';
      if (key === 'CentreID') return '10';
      return '';
    });

    mockCustomService = jasmine.createSpyObj('DaycareQuestionnaireService', [
      'SubmitControlFieldAnswers',
      'SubmitSection',
      'GetSectionByCentreID',
      'SubmitControlAndLabelForm',
      'ActiveInActiveSections',
      'CopyIsMasterTrueSections',
      'GetSectionByIDAndCentreID',
      'GetControlFieldById',
      'EditSection',
      'EditControlAndLabelForm',
      'DeleteSectionByID',
      'DeleteControlAndLabelForm',
      'DeleteSelectiveValue',
      'AddSelectiveValue'
    ]);

    mockCustomService.CopyIsMasterTrueSections.and.returnValue(of({ message: 'Success' }));
    mockCustomService.GetSectionByCentreID.and.returnValue(of({
      message: 'Success',
      result: [
        { id: 1, name: 'General Information' },
        { id: 2, name: 'Medical Routine' }
      ]
    }));
    mockChildRoutineService.GetControlAndLabelForm.and.returnValue(of({
      message: 'Success',
      result: [
        {
          id: 10,
          label: 'Child Nickname',
          controlType: 'text',
          sectionID: 1
        },
        {
          id: 11,
          label: 'Diet Preference',
          controlType: 'select',
          sectionID: 1,
          dropdownItems: [{ label: 'Veg', value: 'veg' }]
        },
        {
          id: 12,
          label: 'Allergies',
          controlType: 'checkbox',
          sectionID: 2,
          checkBoxItems: [{ label: 'Peanuts', value: 'peanuts' }]
        }
      ]
    }));

    modalSpy = jasmine.createSpy('modal');
    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: modalSpy,
      show: jasmine.createSpy('show'),
      hide: jasmine.createSpy('hide'),
      val: jasmine.createSpy('val'),
    });

    await TestBed.configureTestingModule({
      imports: [DaycareQuestionnaireComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        ChangeDetectorRef,
        { provide: DaycareQuestionnaireService, useValue: mockCustomService },
        { provide: ChildRoutineService, useValue: mockChildRoutineService },
        { provide: CookieService, useValue: mockCookieService },
        { provide: ToastrService, useValue: mockToastr }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(DaycareQuestionnaireComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(DaycareQuestionnaireComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
    expect(component.LabelAndControlForm).toBeDefined();
    expect(component.AddSectionForm).toBeDefined();
    expect(component.EditSectionForm).toBeDefined();
    expect(component.controlFieldForm).toBeDefined();
  });

  describe('ngOnInit and Form Initialization', () => {
    it('should initialize cookie values and fetch sections and fields', async () => {
      await component.ngOnInit();

      expect(component.login).toBe(101);
      expect(component.UserRoleID).toBe('4');
      expect(component.CentreID).toBe('10');
      expect(mockCustomService.CopyIsMasterTrueSections).toHaveBeenCalled();
      expect(mockCustomService.GetSectionByCentreID).toHaveBeenCalled();
      expect(mockChildRoutineService.GetControlAndLabelForm).toHaveBeenCalled();
      expect(component.SectionList.length).toBe(2);
      expect(component.fields.length).toBe(2);
    });
  });

  describe('Type Mappings and Custom Validators', () => {
    it('should map control types correctly in mapControlType', () => {
      expect(component.mapControlType('text')).toBe('textbox');
      expect(component.mapControlType('number')).toBe('number');
      expect(component.mapControlType('select')).toBe('select');
      expect(component.mapControlType('checkbox')).toBe('checkbox');
      expect(component.mapControlType('radio')).toBe('radio');
      expect(component.mapControlType('textarea')).toBe('textarea');
      expect(component.mapControlType('unknown')).toBe('textbox');
    });

    it('should map default values correctly in mapDefaultValue', () => {
      expect(component.mapDefaultValue('text')).toBe('');
      expect(component.mapDefaultValue('number')).toBeNull();
      expect(component.mapDefaultValue('checkbox')).toBeFalse();
      expect(component.mapDefaultValue('select')).toBeNull();
      expect(component.mapDefaultValue('textarea')).toBe('');
    });

    it('should validate required non-whitespace strings in requiredNotOnlySpaces', () => {
      const validator = component.requiredNotOnlySpaces();
      expect(validator(new FormControl('Valid text'))).toBeNull();
      expect(validator(new FormControl('   '))).toEqual({ required: true });
      expect(validator(new FormControl(null))).toBeNull();
    });

    it('should validate comma separated strings in commaSeparatedValidator', () => {
      const valid = component.commaSeparatedValidator(new FormControl('Apple, Orange, Banana'));
      expect(valid).toBeNull();

      const invalid = component.commaSeparatedValidator(new FormControl('Apple,, Orange'));
      expect(invalid).toEqual({ invalidFormat: true });
    });
  });

  describe('Checkbox and Dynamic Control Management', () => {
    it('should handle checkbox selections on onCheckboxChange', () => {
      component.myControlForm.addControl('allergies', new FormArray([]));
      const eventChecked = { target: { checked: true } };
      component.onCheckboxChange(eventChecked, 'Peanuts', 'allergies');

      const array = component.myControlForm.get('allergies') as FormArray;
      expect(array.length).toBe(1);
      expect(array.at(0).value).toBe('Peanuts');

      const eventUnchecked = { target: { checked: false } };
      component.onCheckboxChange(eventUnchecked, 'Peanuts', 'allergies');
      expect(array.length).toBe(0);
    });

    it('should submit answers on onSubmit', () => {
      component.fields = [
        { id: 10, name: 'childnickname' }
      ];
      component.myControlForm.addControl('childnickname', new FormControl('Johnny'));
      mockCustomService.SubmitControlFieldAnswers.and.returnValue(of({ message: 'Success' }));

      component.onSubmit();

      expect(mockCustomService.SubmitControlFieldAnswers).toHaveBeenCalledWith([
        { controlLabelId: 10, value: ['Johnny'] }
      ]);
      expect(mockToastr.success).toHaveBeenCalledWith('Data submitted successfully');
    });
  });

  describe('Section Management', () => {
    it('should submit new section on onSubmitSectionForm', () => {
      component.AddSectionForm.patchValue({ SectionTitle: 'New Activities' });
      mockCustomService.SubmitSection.and.returnValue(of({ message: 'Success' }));
      spyOn(component, 'GetSectionByCentreID');

      component.onSubmitSectionForm();

      expect(mockCustomService.SubmitSection).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Section Added Successfully');
      expect(modalSpy).toHaveBeenCalledWith('hide');
      expect(component.GetSectionByCentreID).toHaveBeenCalled();
    });

    it('should open section modal on OpenSectionModal', () => {
      component.OpenSectionModal();
      expect((window as any).$).toHaveBeenCalledWith('#addSectionModal');
      expect(modalSpy).toHaveBeenCalledWith('show');
    });

    it('should activate and deactivate section on ActiveInActiveSections', () => {
      mockCustomService.ActiveInActiveSections.and.returnValue(of({
        message: 'Section InActivated Successfully'
      }));

      // Test Inactivation
      const mockEyeEvent = { target: { className: 'fa fa-eye' } };
      component.ActiveInActiveSections(1, mockEyeEvent);
      expect(mockCustomService.ActiveInActiveSections).toHaveBeenCalledWith({
        sectionId: 1,
        wantToActive: false
      });
      expect(mockToastr.success).toHaveBeenCalledWith('Section Deactivated Successfully');

      // Test Activation
      mockCustomService.ActiveInActiveSections.and.returnValue(of({
        message: 'Section Activated Successfully'
      }));
      const mockSlashEvent = { target: { className: 'fa fa-eye-slash' } };
      component.ActiveInActiveSections(1, mockSlashEvent);
      expect(mockCustomService.ActiveInActiveSections).toHaveBeenCalledWith({
        sectionId: 1,
        wantToActive: true
      });
      expect(mockToastr.success).toHaveBeenCalledWith('Section Activated Successfully');
    });

    it('should fetch section by ID and patch edit form in GetSectionByIDAndCentreID', () => {
      mockCustomService.GetSectionByIDAndCentreID.and.returnValue(of({
        message: 'Success',
        result: {
          id: 5,
          name: 'Section Five',
          fields: []
        }
      }));

      component.GetSectionByIDAndCentreID(5);

      expect(mockCustomService.GetSectionByIDAndCentreID).toHaveBeenCalledWith(5, '10');
      expect(component.EditSectionForm.value.id).toBe(5);
      expect(component.EditSectionForm.value.SectionNameE).toBe('Section Five');
      expect(modalSpy).toHaveBeenCalledWith('show');
    });
  });

  describe('Control and Label Management', () => {
    it('should submit control with values on onLabelAndControlSubmit', () => {
      component.LabelAndControlForm.patchValue({
        SectionID: 1,
        LabelName: 'Meal Choice',
        ControlType: 'select',
        Values: 'Veg, Non-Veg',
        Position: 1
      });
      mockCustomService.SubmitControlAndLabelForm.and.returnValue(of({
        message: 'Control Added Successfully'
      }));
      spyOn(component, 'GetControlAndLabelForm');

      component.onLabelAndControlSubmit();

      expect(mockCustomService.SubmitControlAndLabelForm).toHaveBeenCalledWith(jasmine.objectContaining({
        labelName: 'Meal Choice',
        controlType: 'select',
        values: ['Veg', 'Non-Veg'],
        position: 1,
        sectionID: 1
      }));
      expect(mockToastr.success).toHaveBeenCalledWith('Control Added Successfully');
      expect(component.GetControlAndLabelForm).toHaveBeenCalled();
    });

    it('should submit control without values on onLabelAndControlSubmit', () => {
      component.LabelAndControlForm.patchValue({
        SectionID: 1,
        LabelName: 'Height',
        ControlType: 'number',
        Values: '',
        Position: 2
      });
      mockCustomService.SubmitControlAndLabelForm.and.returnValue(of({
        message: 'Control Added Successfully'
      }));

      component.onLabelAndControlSubmit();

      expect(mockCustomService.SubmitControlAndLabelForm).toHaveBeenCalledWith(jasmine.objectContaining({
        labelName: 'Height',
        controlType: 'number',
        values: [],
        position: 2
      }));
    });

    it('should show selective value input on showSelectiveValueInput', () => {
      component.showSelectiveValueInput({ target: { value: 'select' } });
      expect((window as any).$).toHaveBeenCalledWith('#options-input');
    });
  });
});
