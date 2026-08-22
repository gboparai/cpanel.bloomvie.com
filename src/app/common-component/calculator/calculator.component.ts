import { Component } from '@angular/core';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonService } from '../common.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { WelcomeService } from '../../welcome/welcome.service';
import { NgIf } from '@angular/common';
declare var $: any;

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [BreadcrumbComponent, NgSelectModule,
    FormsModule,
    ReactiveFormsModule, NgIf],
  templateUrl: './calculator.component.html',
  styleUrl: './calculator.component.css'
})
export class CalculatorComponent {


  dayCareCalculatorForm!: FormGroup;



  centerTypes = [
    { value: '1', label: 'Child Care Center' },
    { value: '2', label: 'Multi-Center or Franchise Center' },
    { value: '3', label: 'School District' },
    { value: '4', label: 'Before and After School Program' },
    { value: '5', label: 'Park District' },
    { value: '6', label: 'Church or Faith-Based Organization' },
    { value: '7', label: 'In-Home Child Care' }
  ];



  daycaretype: any;
  calculatorValue: any;
  dayCareTypeID: any;
  activityName: any;
  typeofLogic: any;
  DCCactivityName: any;
  id: any;
  DCCtypeofLogic: any;
  AllCalculatorValues: any;
  ddcCalculatorID: any;
  calculatordurationType: any;
  durationType: any;



  constructor(private fb: FormBuilder, private spinner: NgxSpinnerService, private service: CommonService, private toastr: ToastrService,) { }

  ngOnInit(): void {
    this.dayCareCalculatorForm = this.fb.group({
      id: [],
      dayCareTypeID: [null, Validators.required],
      activityName: ['', Validators.required],
      activityDurationType: ['', Validators.required],
      typeofLogic: ['', Validators.required],
      bloomvieActivityTime: [null],
      manualActivityTime: [null],
      bloomvieActivityCost: [null],
      manualActivityCost: [null],
      studentIncrementTime: [null],
      teacherIncrementTime: [null],
      studentIncrementCost: [null],
      teacherIncrementCost: [null],
      studentManualIncrementTime: [null],
      teacherManualIncrementTime: [null],
      studentManualIncrementCost: [null],
      teacherManualIncrementCost: [null]
    });



  }


  onSelectDayCareType(event: any) {


    this.activityName = []
    this.typeofLogic = []
    this.durationType = []
    this.dayCareCalculatorForm.get('activityName')?.reset();
    this.dayCareCalculatorForm.get('activityDurationType')?.reset();
    this.dayCareCalculatorForm.get('typeofLogic')?.reset();

    this.dayCareTypeID = event.value
    this.getCalculatorActivityName()

  }


  onSelectActivityName(event: any) {


    this.typeofLogic = []
    this.durationType = []
    this.dayCareCalculatorForm.get('activityDurationType')?.reset();
    this.dayCareCalculatorForm.get('typeofLogic')?.reset();
    this.DCCtypeofLogic = []
    this.calculatordurationType = '';
    this.DCCactivityName = '';

    this.activityName = event.activityName
    this.id = event.id

    this.getCalculatordurationType()
  }



  onSelectActivityDurationType(event: any) {


    this.typeofLogic = []
    this.dayCareCalculatorForm.get('typeofLogic')?.reset();

    this.durationType = event.activityDurationType
    this.getCalculatorLogic()

  }




  onSelectLogicType(event: any) {


    this.typeofLogic = event.typeofLogic;

    const fields = [
      'studentManualIncrementTime', 'studentManualIncrementCost', 'studentIncrementTime', 'studentIncrementCost',
      'teacherManualIncrementTime', 'teacherManualIncrementCost', 'teacherIncrementTime', 'teacherIncrementCost',
      'bloomvieActivityTime', 'manualActivityTime', 'bloomvieActivityCost', 'manualActivityCost'
    ];

    const setFieldValidators = (fields: string[], isRequired: boolean) => {
      fields.forEach(field => {
        const control = this.dayCareCalculatorForm.get(field);
        if (control) {
          if (isRequired) {
            control.setValidators([Validators.required]);
          } else {
            control.clearValidators();
          }
          control.setValue(isRequired ? 0 : null);
          control.updateValueAndValidity();
        }
      });
    };

    switch (this.typeofLogic) {
      case 'student':
        setFieldValidators([

          'studentManualIncrementTime', 'studentManualIncrementCost', 'studentIncrementTime', 'studentIncrementCost',
          'bloomvieActivityTime', 'manualActivityTime', 'bloomvieActivityCost', 'manualActivityCost'
        ], true);
        break;

      case 'teacher':
        setFieldValidators([
          'teacherManualIncrementTime', 'teacherManualIncrementCost', 'teacherIncrementTime', 'teacherIncrementCost',
          'bloomvieActivityTime', 'manualActivityTime', 'bloomvieActivityCost', 'manualActivityCost'
        ], true);
        break;

      case 'staff':
      case 'finance':
        setFieldValidators([
          'studentManualIncrementTime', 'studentManualIncrementCost', 'studentIncrementTime', 'studentIncrementCost',
          'teacherManualIncrementTime', 'teacherManualIncrementCost', 'teacherIncrementTime', 'teacherIncrementCost',
          'bloomvieActivityTime', 'manualActivityTime', 'bloomvieActivityCost', 'manualActivityCost'
        ], true);
        break;

      default:
        setFieldValidators(fields, false);
        break;
    }

    this.getCalculatorValue();
  }






  dayCareCentreCalculator() {

    if (this.dayCareCalculatorForm.valid) {
      this.spinner.show();

      this.dayCareCalculatorForm.patchValue({
        dayCareTypeID: parseInt(this.dayCareCalculatorForm.value.dayCareTypeID),
        id: this.id
      });

      this.service.updateDayCareCentreCalculator(this.dayCareCalculatorForm.value).subscribe(
        (data: any) => {
          this.spinner.hide();

          if (data.message === "DayCare Center Calculator entry updated successfully") {
            this.toastr.success(data.message);
            this.dayCareCalculatorForm.reset();
            this.dayCareTypeID = []
            this.id = []
            this.activityName = []
            this.typeofLogic = []
            this.durationType = []
          } else if (data.message === "DayCare Center Calculator entry created successfully") {
            this.toastr.success(data.message);
            this.dayCareCalculatorForm.reset();
          } else {
            this.toastr.warning(data.message || "An unexpected response was received.");
          }
        },
        (error) => {
          this.spinner.hide();
          console.error("Error during API call:", error);
          this.toastr.error("Error occurred while submitting the form.");
        }
      );
    } else {
      this.dayCareCalculatorForm.markAllAsTouched();
    }
  }



  getCalculatorValue(): void {


    this.service.getCalculatorValue(
      this.dayCareTypeID,
      this.id,
      this.activityName,
      this.typeofLogic,
      this.durationType
    )
      .subscribe(
        (data) => {
          if (data.message === "OK") {
            this.calculatorValue = data.result;


            this.dayCareCalculatorForm.patchValue({
              manualActivityCost: this.calculatorValue[0]?.manualActivityCost || null, // Patch the value here
            });

            this.dayCareCalculatorForm.patchValue({
              bloomvieActivityTime: this.calculatorValue[0]?.bloomvieActivityTime || null,
              manualActivityTime: this.calculatorValue[0]?.manualActivityTime || null,
              bloomvieActivityCost: this.calculatorValue[0]?.bloomvieActivityCost || null,
              manualActivityCost: this.calculatorValue[0]?.manualActivityCost || null,
              studentIncrementTime: this.calculatorValue[0]?.studentIncrementTime || null,
              teacherIncrementTime: this.calculatorValue[0]?.teacherIncrementTime || null,
              studentIncrementCost: this.calculatorValue[0]?.studentIncrementCost || null,
              teacherIncrementCost: this.calculatorValue[0]?.teacherIncrementCost || null,
              studentManualIncrementTime: this.calculatorValue[0]?.studentManualIncrementTime || null,
              teacherManualIncrementTime: this.calculatorValue[0]?.teacherManualIncrementTime || null,
              studentManualIncrementCost: this.calculatorValue[0]?.studentManualIncrementCost || null,
              teacherManualIncrementCost: this.calculatorValue[0]?.teacherManualIncrementCost || null,
            });
          } else {
            console.error("Error fetching calculator value:", data.message);
          }
        },
        (error) => {
          console.error("API Error:", error);
        }
      );
  }


  getCalculatorActivityName(): void {


    this.service
      .getCalculatorActivityName(this.dayCareTypeID).subscribe(
        (data) => {
          if (data.message === "OK") {
            this.DCCactivityName = data.result;

          } else {
            console.error("Error fetching calculator value:", data.message);
          }
        },
        (error) => {
          console.error("API Error:", error);
        }
      );
  }

  getCalculatordurationType(): void {


    this.service
      .getCalculatordurationType(this.id, this.activityName).subscribe(
        (data) => {
          if (data.message === "OK") {
            this.calculatordurationType = data.result;
          } else {
            console.error("Error fetching calculator value:", data.message);
          }
        },
        (error) => {
          console.error("API Error:", error);
        }
      );
  }


  getCalculatorLogic(): void {

    this.service
      .getCalculatorLogic(this.id, this.durationType).subscribe(
        (data) => {
          if (data.message === "OK") {
            this.DCCtypeofLogic = data.result;


          } else {
            console.error("Error fetching calculator value:", data.message);
          }
        },
        (error) => {
          console.error("API Error:", error);
        }
      );
  }




}