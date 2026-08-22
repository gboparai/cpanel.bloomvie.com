import { RouterLink } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { BreadcrumbComponent } from '../common-component/breadcrumb/breadcrumb.component';

// sahib added on 14/10/2024
import { ReactiveFormsModule, FormGroup, FormBuilder, FormArray, Validators, AbstractControl, FormControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { CommonModule, NgFor } from '@angular/common';
import { CustomFormService } from './custom-form.service';
import { CookieService } from 'ngx-cookie-service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ChildRoutineComponent } from '../parent-management/parent-onboarding/child-routine/child-routine.component';
declare var $: any;
@Component({
  selector: 'app-custom-form',
  standalone: true,
  imports: [RouterLink, BreadcrumbComponent, ReactiveFormsModule, NgFor, CommonModule, ToastrModule],
  templateUrl: './custom-form.component.html',
  styleUrls: ['./custom-form.component.css']
})
export class CustomFormComponent implements OnInit {

  @ViewChild(ChildRoutineComponent) childRoutineComponent!: ChildRoutineComponent;
  AddSectionForm: FormGroup;
  UserRoleID: any;
  SectionList: any;
  CentreID: any;
  myControlForm!: FormGroup;
  LabelAndControlForm: FormGroup;
  fields: any[] = [];

  pleaseSelect!: string; // ! <- this tells that it will be initialized later
  IsValuesControlValid: boolean = false;
  //isValueEmpty: boolean = false;
  constructor(private fb: FormBuilder, private _customService: CustomFormService, private cookie: CookieService, private toastr: ToastrService) {
    this.myControlForm = this.fb.group({
      dynamicFields: this.fb.array([])
    })
    this.LabelAndControlForm = this.fb.group({
      SectionID: ['', Validators.required],
      LabelName: ['', [this.requiredNotOnlySpaces()]],
      ControlType: ['', [Validators.required]],
      Values: ['', []],
      Position: [null]
    })
    this.AddSectionForm = this.fb.group({
      SectionTitle: ['', Validators.required]
    })
  }

  ngOnInit() {

    this.UserRoleID = this.cookie.get('UserRoleID');
    this.CentreID = this.cookie.get('CentreID');
    this.GetSectionByCentreID();

    const fieldTypeSelect = document.getElementById('field-type') as HTMLSelectElement;
    const OptionsInput = document.getElementById('options-input') as HTMLElement;
    const inputFieldContainer = document.getElementById('input-field-container') as HTMLElement;

    if (fieldTypeSelect && OptionsInput && inputFieldContainer) {
      fieldTypeSelect.addEventListener('change', () => {
        // Clear previous input fields
        inputFieldContainer.innerHTML = '';

        // Display dropdown options if 'dropdown' is selected
        if (fieldTypeSelect.value === 'select' || fieldTypeSelect.value === 'checkbox' || fieldTypeSelect.value === 'radio') {
          OptionsInput.style.display = 'block';

          const addFieldButton = document.getElementById('addFieldButton') as HTMLButtonElement;
          // addFieldButton.disabled = true;

          const valuesControl = this.LabelAndControlForm.get('Values');
          valuesControl?.clearValidators();
          valuesControl?.setValidators([this.commaSeparatedValidator]);

        } else {
          OptionsInput.style.display = 'none';

        }
      });
    }
  }

  // GetControlAndLabelForm() {

  //   this._customService.GetControlAndLabelForm(2).subscribe((data) => {
  //     const formattedfields = data.result;

  //     this.fields = this.mapApiResponseToFields(formattedfields);
  //     this.populateForm();
  //   }, (e) => {
  //   });
  // }

  // mapApiResponseToFields(apiResponse: any) {
  //   return apiResponse.map((item: any) => {
  //     const field: any = {
  //       id:item.id,
  //       name: item.label.toLowerCase().replace(/\s+/g, ''), // Create a name from the label
  //       label: item.label,
  //       controlType: this.mapControlType(item.controlType),
  //       value: this.mapDefaultValue(item.controlType), // Set default value based on control type
  //     };

  //     // Add dropdown, checkbox, or radio items if applicable
  //     if (item.controlType === 'select') {
  //       field.options = item.dropdownItems.map((option: any) => ({
  //         label: option.label,
  //         value: option.value
  //       }));
  //     } else if (item.controlType === 'checkbox') {
  //       field.options = item.checkBoxItems.map((option: any) => ({
  //         label: option.label,
  //         value: option.value
  //       }));
  //     } else if (item.controlType === 'radio') {
  //       field.options = item.radioItems.map((option: any) => ({
  //         label: option.label,
  //         value: option.value
  //       }));
  //     }

  //     return field;
  //   });
  // }




  mapApiResponseToFields(apiResponse: any) {

    return apiResponse.map((item: any) => {
      const field: any = {
        id: item.id,
        name: item.label.toLowerCase().replace(/\s+/g, ''), // Create a name from the label
        label: item.label,
        controlType: this.mapControlType(item.controlType),
        value: this.mapDefaultValue(item.controlType), // Set default value based on control type
      };

      // Add dropdown, checkbox, or radio items if applicable
      if (item.controlType === 'select') {
        field.options = item.dropdownItems.map((option: any) => ({
          label: option.label,
          value: option.value
        }));
      } else if (item.controlType === 'checkbox') {
        field.options = item.checkBoxItems.map((option: any) => ({
          label: option.label,
          value: option.value
        }));
        this.myControlForm.addControl(
          field.name,
          this.fb.array([]) // Initialize as FormArray for checkboxes
        );
      } else if (item.controlType === 'radio') {
        field.options = item.radioItems.map((option: any) => ({
          label: option.label,
          value: option.value
        }));
      }

      return field;
    });
  }


  mapControlType(controlType: string) {

    switch (controlType) {
      case 'text':
        return 'textbox';
      case 'number':
        return 'number';
      case 'select':
        return 'select';
      case 'checkbox':
        return 'checkbox';
      case 'radio':
        return 'radio';
      case 'date':
        return 'date';
      case 'datetime':
        return 'datetime';
      default:
        return 'textbox'; // Default to textbox if unknown
    }
  }
  mapDefaultValue(controlType: string) {

    switch (controlType) {
      case 'text':
        return ''; // Default for text
      case 'number':
        return null; // Default for number
      case 'checkbox':
        return false; // Default for checkbox
      case 'radio':
        return null; // Default for radio (no selection)
      case 'select':
        return null; // Default for select (no selection)
      case 'date':
        return null;
      case 'datetime':
        return null;
      default:
        return ''; // Default for unknown types
    }
  }

  populateForm() {

    // this.myControlForm = this.fb.group({});
    // this.fields.forEach(field => {
    //   if (field.controlType === 'checkboxGroup') {
    //     // Initialize as an empty array for checkbox group
    //     this.myControlForm.addControl(field.name, this.fb.control([]));
    //   } else {
    //     const control = this.fb.control(field.value || '');
    //     this.myControlForm.addControl(field.name, control);
    //   }
    // });
    this.myControlForm = this.fb.group({});
    this.fields.forEach(field => {
      if (field.controlType === 'checkbox') {
        this.myControlForm.addControl(field.name, this.fb.array([])); // Initialize as FormArray for checkboxes
      } else {
        this.myControlForm.addControl(field.name, new FormControl(field.value || ''));
      }
    });
  }

  // onSubmit() {
  //   const formValue = this.myControlForm.value;
  //    const submittedData = this.fields.map(field=>({
  //     controlLabelId:field.id,
  //     value:formValue[field.name],

  //    }))
  //    let model =submittedData;


  //    this._customService.SubmitControlFieldAnswers(model).subscribe((response)=>{
  //        if(response.message === "Success"){
  //         this.toastr.success('data submitted');
  //        }
  //    },(e)=>{

  //    })

  // }


  // onCheckboxChange(event: any, value: string, fieldName: string) {

  //   const interests: string[] = this.myControlForm.get(fieldName)?.value || [];
  //   if (event.target.checked) {
  //     interests.push(value);
  //   } else {
  //     const index = interests.indexOf(value);
  //     if (index > -1) {
  //       interests.splice(index, 1);
  //     }
  //   }
  //   this.myControlForm.get('interests')?.setValue(interests);
  // }


  // sahib added on 14/10/2024


  // Method to handle checkbox changes


  //Arsh
  // onCheckboxChange(event: any, value: string, controlName: string) {
  //   const formArray: FormArray = this.myControlForm.get(controlName) as FormArray;

  //   if (event.target.checked) {
  //     formArray.push(new FormControl(value));  // Add value if checked
  //   } else {
  //     const index = formArray.controls.findIndex((ctrl) => ctrl.value === value);
  //     if (index !== -1) {
  //       formArray.removeAt(index);  // Remove value if unchecked
  //     }
  //   }
  // }



  // onSubmit() {
  //   const formValue = this.myControlForm.value;

  //   // Map through fields to create submittedData
  //   const submittedData = this.fields.map(field => {
  //     const fieldValue = formValue[field.name];
  //     return {
  //       controlLabelId: field.id,
  //       value: Array.isArray(fieldValue) ? fieldValue : fieldValue || ''  // Handles both arrays and single values
  //     };
  //   });

  //   // Set the data model for submission
  //   const model = submittedData;

  //   // Call service to submit data
  //   this._customService.SubmitControlFieldAnswers(model).subscribe(
  //     (response) => {
  //       if (response.message === "Success") {
  //         this.toastr.success('Data submitted successfully');
  //       }
  //     },
  //     (error) => {

  //     }
  //   );

  //   // Log the final formatted data

  // }

  onSubmit() {
    const formValue = this.myControlForm.value;

    const submittedData = this.fields.map(field => {
      const fieldValue = formValue[field.name];

      return {
        controlLabelId: field.id,
        // Ensure value is sent as an array of strings
        value: Array.isArray(fieldValue) ? fieldValue : [String(fieldValue)]
      };
    });

    // Submit the formatted data to the backend
    this._customService.SubmitControlFieldAnswers(submittedData).subscribe(
      (response) => {
        if (response.message === "Success") {
          this.toastr.success('Data submitted successfully');
        }
      },
      (error) => {
        console.error('Error submitting data:', error);
      }
    );

  }




  onCheckboxChange(event: any, value: string, controlName: string) {
    const formArray: FormArray = this.myControlForm.get(controlName) as FormArray;

    if (event.target.checked) {
      formArray.push(new FormControl(value));  // Add value if checked
    } else {
      const index = formArray.controls.findIndex((ctrl) => ctrl.value === value);
      if (index !== -1) {
        formArray.removeAt(index);  // Remove value if unchecked
      }
    }
  }



  commaSeparatedValidator(control: AbstractControl) {
    if (!control.value) {
      return null;
    }
    const regex = /^(\s*[\w\s]+\s*,\s*)*\s*[\w\s]+\s*$/;
    const valid = regex.test(control.value);
    return valid ? null : { invalidFormat: true };
  }
  // for disable button, it returns true if the value is not empty
  areFieldsFilled(): boolean {
    const { LabelName, ControlType } = this.LabelAndControlForm.value;
    return LabelName.trim() !== '' && ControlType.trim() !== '';
  }
  requiredNotOnlySpaces(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      // Allow null
      if (value === null) {
        return null; // No error
      }

      // Check if the value is empty or consists only of spaces
      const isInvalid = value.trim().length === 0;
      return isInvalid ? { required: true } : null; // Return error object if invalid
    };
  }


  // added on 12/11/2024
  onSubmitSectionForm() {
    let sectionModel = {
      centreID: this.CentreID,
      SectionName: this.AddSectionForm.value.SectionTitle
    }
    this._customService.SubmitSection(sectionModel).subscribe((data) => {
      if (data.message === "Success") {
        this.toastr.success('Section Added Successfully');
        this.GetSectionByCentreID();

        this.AddSectionForm.reset();
      }
      else if (data.message == "Section Already Exists") {
        this.toastr.info("Section Already Exists");
      }
    }, (e) => {

    })
  }
  GetSectionByCentreID() {
    this._customService.GetSectionByCentreID(this.CentreID).subscribe((data) => {
      this.SectionList = data.result;

    }, (e) => { })
  }

  OpenSectionModal() {
    $('#addSectionModal').modal('show');
  }
  onLabelAndControlSubmit() {
    let Values__ = [];
    if (this.LabelAndControlForm.valid) {
      if (this.LabelAndControlForm.value.Values !== "" && this.LabelAndControlForm.value.Values !== null) {
        const Values_ = this.LabelAndControlForm.value.Values.split(',').map((value: string) => value.trim());
        Values__ = Values_;
        let model = {
          labelName: this.LabelAndControlForm.value.LabelName,
          controlType: this.LabelAndControlForm.value.ControlType,
          values: Values__,
          // userId: this.cookie.get('UserId'),
          // userRoleId: this.cookie.get('UserRoleId'),

          userId: Number(this.cookie.get('UserId')),
          userRoleId: Number(this.UserRoleID),
          //centreId:this.cookie.get('CentreID')
          centreId: Number(this.cookie.get('CentreID')),
          position: this.LabelAndControlForm.value.Position,
          sectionID: this.LabelAndControlForm.value.SectionID
        }

        this._customService.SubmitControlAndLabelForm(model).subscribe((data) => {
          if (data.message === "Control Added Successfully") {

            this.LabelAndControlForm.reset({
              LabelName: '',
              ControlType: '',
              Values: '',
              sectionName: ''
            });
            this.LabelAndControlForm.reset({
              LabelName: '',
              ControlType: '',
              Values: '',
              Position: null
            });
            $('#Custom-form').modal('hide');
            const optionsInput_ = document.getElementById('options-input') as HTMLElement;
            if (optionsInput_) {
              optionsInput_.style.display = 'none';
            }
            // here

            this.toastr.success("Control Added Successfully");
          }
          else {
            this.toastr.info("Control Already Exists");
          }
        }, (e) => {
          this.toastr.info("Internal Server Error");
        })

        const labelNameInput = document.getElementById('labelName') as HTMLInputElement;
        if (labelNameInput) {
          labelNameInput.value = '';
        }

        const Values = document.getElementById('options') as HTMLInputElement;
        if (Values) {
          Values.value = '';
        }
        this.LabelAndControlForm.patchValue({ Values: '' });
      }
      else {
        let model = {
          labelName: this.LabelAndControlForm.value.LabelName,
          controlType: this.LabelAndControlForm.value.ControlType,
          values: [],
          userId: Number(this.cookie.get('UserId')),
          userRoleId: Number(this.UserRoleID),
          centreId: Number(this.cookie.get('CentreID')),
          position: this.LabelAndControlForm.value.Position,
          sectionID: this.LabelAndControlForm.value.SectionID
        }

        this._customService.SubmitControlAndLabelForm(model).subscribe((data) => {
          if (data.message === "Control Added Successfully") {

            this.LabelAndControlForm.reset({
              LabelName: '',
              ControlType: '',
            });
            // here

            this.toastr.success("Control Added Successfully");
            this.LabelAndControlForm.reset({
              LabelName: '',
              ControlType: '',
              Values: '',
              Position: null
            });
            $('#Custom-form').modal('hide');
          }
          else {
            this.toastr.info("Control Already Exists");
          }
        }, (e) => {
          this.toastr.info("Internal Server Error");
        })

        const labelNameInput = document.getElementById('labelName') as HTMLInputElement;
        if (labelNameInput) {
          labelNameInput.value = '';
        }
      }
    }
    else {
      this.LabelAndControlForm.patchValue({ Values: '' });
      const labelNameInput = document.getElementById('labelName') as HTMLInputElement;
      if (labelNameInput) {
        labelNameInput.value = '';
      }
      this.LabelAndControlForm.reset({
        LabelName: '',
        ControlType: '',
        Values: ''
      });
    }
  }
}
