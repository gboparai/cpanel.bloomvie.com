import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalculatorComponent } from './calculator.component';
import { CommonService } from '../common.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

describe('CalculatorComponent', () => {
  let component: CalculatorComponent;
  let fixture: ComponentFixture<CalculatorComponent>;

  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {
    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal')
    });

    mockCommonService = jasmine.createSpyObj('CommonService', [
      'updateDayCareCentreCalculator',
      'getCalculatorValue',
      'getCalculatorActivityName',
      'getCalculatordurationType',
      'getCalculatorLogic'
    ]);
    mockCommonService.updateDayCareCentreCalculator.and.returnValue(of({ message: 'OK' }));
    mockCommonService.getCalculatorValue.and.returnValue(of({
      message: 'OK',
      result: [
        {
          manualActivityCost: 50,
          bloomvieActivityTime: 10,
          manualActivityTime: 30,
          bloomvieActivityCost: 20
        }
      ]
    }));
    mockCommonService.getCalculatorActivityName.and.returnValue(of({
      message: 'OK',
      result: [{ id: 1, name: 'Attendance' }]
    }));
    mockCommonService.getCalculatordurationType.and.returnValue(of({
      message: 'OK',
      result: [{ id: 1, type: 'Daily' }]
    }));
    mockCommonService.getCalculatorLogic.and.returnValue(of({
      message: 'OK',
      result: [{ id: 1, logic: 'Flat' }]
    }));

    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);

    await TestBed.configureTestingModule({
      imports: [CalculatorComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: CommonService, useValue: mockCommonService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: ToastrService, useValue: mockToastr }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(CalculatorComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalculatorComponent);
    component = fixture.componentInstance;
  });

  it('should create the CalculatorComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize dayCareCalculatorForm with validators', () => {
      component.ngOnInit();
      expect(component.dayCareCalculatorForm).toBeDefined();
      expect(component.dayCareCalculatorForm.get('dayCareTypeID')).toBeDefined();
      expect(component.dayCareCalculatorForm.get('activityName')).toBeDefined();
      expect(component.dayCareCalculatorForm.valid).toBeFalse();
    });
  });

  describe('onSelectDayCareType', () => {
    it('should reset sub-dropdowns and fetch activity names', () => {
      component.ngOnInit();
      spyOn(component, 'getCalculatorActivityName').and.callThrough();

      component.onSelectDayCareType({ value: '1' });

      expect(component.dayCareTypeID).toBe('1');
      expect(component.getCalculatorActivityName).toHaveBeenCalled();
      expect(mockCommonService.getCalculatorActivityName).toHaveBeenCalledWith('1');
    });
  });

  describe('onSelectActivityName', () => {
    it('should update form and fetch duration types', () => {
      component.ngOnInit();
      spyOn(component, 'getCalculatordurationType').and.callThrough();

      component.onSelectActivityName({ id: 2, activityName: 'Meal Tracking' });

      expect(component.id).toBe(2);
      expect(component.activityName).toBe('Meal Tracking');
      expect(component.getCalculatordurationType).toHaveBeenCalled();
      expect(mockCommonService.getCalculatordurationType).toHaveBeenCalledWith(2, 'Meal Tracking');
    });
  });

  describe('onSelectActivityDurationType', () => {
    it('should update duration type and fetch calculator logic', () => {
      component.ngOnInit();
      spyOn(component, 'getCalculatorLogic').and.callThrough();

      component.onSelectActivityDurationType({ durationType: 'Weekly' });

      expect(component.durationType).toBe('Weekly');
      expect(component.getCalculatorLogic).toHaveBeenCalled();
    });
  });

  describe('onSelectLogicType', () => {
    it('should update logic type and fetch calculator values', () => {
      component.ngOnInit();
      spyOn(component, 'getCalculatorValue').and.callThrough();

      component.onSelectLogicType({ typeofLogic: 'Per Student' });

      expect(component.typeofLogic).toBe('Per Student');
      expect(component.getCalculatorValue).toHaveBeenCalled();
    });
  });

  describe('getCalculatorValue', () => {
    it('should patch calculator values into the reactive form', () => {
      component.ngOnInit();
      component.dayCareTypeID = '1';
      component.id = 2;
      component.activityName = 'Activity';
      component.typeofLogic = 'Flat';
      component.durationType = 'Monthly';

      component.getCalculatorValue();

      expect(mockCommonService.getCalculatorValue).toHaveBeenCalledWith('1', 2, 'Activity', 'Flat', 'Monthly');
      expect(component.dayCareCalculatorForm.value.bloomvieActivityTime).toBe(10);
      expect(component.dayCareCalculatorForm.value.manualActivityCost).toBe(50);
    });
  });

  describe('dayCareCentreCalculator', () => {
    it('should submit form when valid and show success toastr', () => {
      component.ngOnInit();
      component.dayCareCalculatorForm.patchValue({
        dayCareTypeID: '1',
        activityName: 'Activity',
        activityDurationType: 'Daily',
        typeofLogic: 'Flat'
      });

      component.dayCareCentreCalculator();

      expect(mockCommonService.updateDayCareCentreCalculator).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Calculater update successfully.');
      expect(mockSpinner.hide).toHaveBeenCalled();
    });
  });
});
