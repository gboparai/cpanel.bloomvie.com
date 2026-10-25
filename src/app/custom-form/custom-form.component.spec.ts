import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomFormComponent } from './custom-form.component';
import { FormBuilder, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CustomFormService } from './custom-form.service';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

describe('CustomFormComponent', () => {
  let component: CustomFormComponent;
  let fixture: ComponentFixture<CustomFormComponent>;
  let mockCustomService: jasmine.SpyObj<CustomFormService>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {
    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal'),
    });

    mockCustomService = jasmine.createSpyObj('CustomFormService', [
      'GetSectionByCentreID',
      'SubmitSection',
      'SubmitControlAndLabelForm',
      'SubmitControlFieldAnswers',
      'GetControlAndLabelForm',
    ]);
    mockCookieService = jasmine.createSpyObj('CookieService', ['get']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'info', 'error']);

    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'UserRoleID') return '3';
      if (key === 'CentreID') return '15';
      if (key === 'UserId') return '101';
      return '';
    });
    mockCustomService.GetSectionByCentreID.and.returnValue(of({ result: [{ id: 1, name: 'General' }] }));

    await TestBed.configureTestingModule({
      imports: [CustomFormComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: CustomFormService, useValue: mockCustomService },
        { provide: CookieService, useValue: mockCookieService },
        { provide: ToastrService, useValue: mockToastr },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(CustomFormComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CustomFormComponent);
    component = fixture.componentInstance;
  });

  it('should create the CustomFormComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize AddSectionForm and LabelAndControlForm', () => {
      expect(component.AddSectionForm.contains('SectionTitle')).toBeTrue();
      expect(component.LabelAndControlForm.contains('SectionID')).toBeTrue();
      expect(component.LabelAndControlForm.contains('LabelName')).toBeTrue();
      expect(component.LabelAndControlForm.contains('ControlType')).toBeTrue();
      expect(component.LabelAndControlForm.contains('Values')).toBeTrue();
    });
  });

  describe('ngOnInit', () => {
    it('should set UserRoleID and CentreID from cookies and fetch sections', () => {
      component.ngOnInit();
      expect(component.UserRoleID).toBe('3');
      expect(component.CentreID).toBe('15');
      expect(mockCustomService.GetSectionByCentreID).toHaveBeenCalledWith('15');
      expect(component.SectionList).toEqual([{ id: 1, name: 'General' }]);
    });
  });

  describe('Mapping Methods', () => {
    it('should map control types accurately', () => {
      expect(component.mapControlType('text')).toBe('textbox');
      expect(component.mapControlType('number')).toBe('number');
      expect(component.mapControlType('select')).toBe('select');
      expect(component.mapControlType('checkbox')).toBe('checkbox');
      expect(component.mapControlType('radio')).toBe('radio');
      expect(component.mapControlType('date')).toBe('date');
      expect(component.mapControlType('datetime')).toBe('datetime');
      expect(component.mapControlType('other')).toBe('textbox');
    });

    it('should map default values accurately', () => {
      expect(component.mapDefaultValue('text')).toBe('');
      expect(component.mapDefaultValue('number')).toBeNull();
      expect(component.mapDefaultValue('checkbox')).toBeFalse();
      expect(component.mapDefaultValue('radio')).toBeNull();
      expect(component.mapDefaultValue('select')).toBeNull();
    });

    it('should map API response to component field structures', () => {
      const apiResponse = [
        { id: 1, label: 'Full Name', controlType: 'text' },
        { id: 2, label: 'Country', controlType: 'select', dropdownItems: [{ label: 'CA', value: '1' }] },
        { id: 3, label: 'Hobbies', controlType: 'checkbox', checkBoxItems: [{ label: 'Sports', value: '1' }] },
        { id: 4, label: 'Gender', controlType: 'radio', radioItems: [{ label: 'M', value: '1' }] },
      ];

      const fields = component.mapApiResponseToFields(apiResponse);

      expect(fields.length).toBe(4);
      expect(fields[0].controlType).toBe('textbox');
      expect(fields[1].options.length).toBe(1);
      expect(fields[2].options.length).toBe(1);
      expect(fields[3].options.length).toBe(1);
    });
  });

  describe('populateForm and onCheckboxChange', () => {
    it('should populate myControlForm controls from fields', () => {
      component.fields = [
        { name: 'fullName', controlType: 'textbox', value: 'John' },
        { name: 'agree', controlType: 'checkbox', value: false },
      ];

      component.populateForm();

      expect(component.myControlForm.contains('fullName')).toBeTrue();
      expect(component.myControlForm.contains('agree')).toBeTrue();
    });

    it('should add or remove checkbox items from FormArray', () => {
      component.fields = [{ name: 'tags', controlType: 'checkbox', value: false }];
      component.populateForm();

      component.onCheckboxChange({ target: { checked: true } }, 'TagA', 'tags');
      const formArray = component.myControlForm.get('tags') as any;
      expect(formArray.value).toContain('TagA');

      component.onCheckboxChange({ target: { checked: false } }, 'TagA', 'tags');
      expect(formArray.value).not.toContain('TagA');
    });
  });

  describe('onSubmit', () => {
    it('should format submitted data and call SubmitControlFieldAnswers', () => {
      component.fields = [{ id: 10, name: 'age' }];
      component.myControlForm = new FormBuilder().group({ age: '25' });
      mockCustomService.SubmitControlFieldAnswers.and.returnValue(of({ message: 'Success' }));

      component.onSubmit();

      expect(mockCustomService.SubmitControlFieldAnswers).toHaveBeenCalledWith([
        { controlLabelId: 10, value: ['25'] },
      ]);
      expect(mockToastr.success).toHaveBeenCalledWith('Data submitted successfully');
    });
  });

  describe('Validators and Helper Methods', () => {
    it('should validate comma-separated values', () => {
      expect(component.commaSeparatedValidator(new FormControl('Option A, Option B'))).toBeNull();
      expect(component.commaSeparatedValidator(new FormControl(''))).toBeNull();
      expect(component.commaSeparatedValidator(new FormControl('Invalid,,,Format,'))).toEqual({ invalidFormat: true });
    });

    it('should check if fields are filled with areFieldsFilled', () => {
      component.LabelAndControlForm.patchValue({ LabelName: 'Name', ControlType: 'text' });
      expect(component.areFieldsFilled()).toBeTrue();

      component.LabelAndControlForm.patchValue({ LabelName: '   ', ControlType: '' });
      expect(component.areFieldsFilled()).toBeFalse();
    });
  });

  describe('Section and Control Submission', () => {
    it('should submit section form on onSubmitSectionForm', () => {
      component.CentreID = '15';
      component.AddSectionForm.patchValue({ SectionTitle: 'Emergency Contacts' });
      mockCustomService.SubmitSection.and.returnValue(of({ message: 'Success' }));

      component.onSubmitSectionForm();

      expect(mockCustomService.SubmitSection).toHaveBeenCalledWith({
        centreID: '15',
        SectionName: 'Emergency Contacts',
      });
      expect(mockToastr.success).toHaveBeenCalledWith('Section Added Successfully');
    });

    it('should open section modal on OpenSectionModal', () => {
      component.OpenSectionModal();
      expect((window as any).$).toHaveBeenCalledWith('#addSectionModal');
    });

    it('should submit control and label form with values', () => {
      component.UserRoleID = '3';
      component.LabelAndControlForm.patchValue({
        SectionID: 1,
        LabelName: 'Status',
        ControlType: 'select',
        Values: 'Active, Inactive',
        Position: 1,
      });
      mockCustomService.SubmitControlAndLabelForm.and.returnValue(
        of({ message: 'Control Added Successfully' })
      );

      component.onLabelAndControlSubmit();

      expect(mockCustomService.SubmitControlAndLabelForm).toHaveBeenCalledWith({
        labelName: 'Status',
        controlType: 'select',
        values: ['Active', 'Inactive'],
        userId: 101,
        userRoleId: 3,
        centreId: 15,
        position: 1,
        sectionID: 1,
      });
      expect(mockToastr.success).toHaveBeenCalledWith('Control Added Successfully');
    });

    it('should submit control and label form without values', () => {
      component.UserRoleID = '3';
      component.LabelAndControlForm.patchValue({
        SectionID: 1,
        LabelName: 'Comments',
        ControlType: 'text',
        Values: '',
        Position: 2,
      });
      mockCustomService.SubmitControlAndLabelForm.and.returnValue(
        of({ message: 'Control Added Successfully' })
      );

      component.onLabelAndControlSubmit();

      expect(mockCustomService.SubmitControlAndLabelForm).toHaveBeenCalledWith({
        labelName: 'Comments',
        controlType: 'text',
        values: [],
        userId: 101,
        userRoleId: 3,
        centreId: 15,
        position: 2,
        sectionID: 1,
      });
    });
  });
});
