import { RouterLink } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { BreadcrumbComponent } from '../common-component/breadcrumb/breadcrumb.component';
import { ChangeDetectorRef } from '@angular/core';
// sahib added on 14/10/2024
import { ReactiveFormsModule, FormGroup, FormBuilder, FormArray, Validators, AbstractControl, FormControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { CommonModule, NgFor } from '@angular/common';

import { CookieService } from 'ngx-cookie-service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ChildRoutineComponent } from '../parent-management/parent-onboarding/child-routine/child-routine.component';
import { DaycareQuestionnaireService } from './daycare-questionnaire.service';
import { ChildRoutineService } from '../parent-management/parent-onboarding/child-routine/child-routine.service';
import { Observable } from 'rxjs';
import { SkeletonLoaderComponent } from "../common-component/skeleton-loader/skeleton-loader.component";
declare var $: any;
@Component({
  selector: 'app-daycare-questionnaire',
  standalone: true,
  imports: [RouterLink, BreadcrumbComponent, ReactiveFormsModule, NgFor, CommonModule, ToastrModule, SkeletonLoaderComponent],
  templateUrl: './daycare-questionnaire.component.html',
  styleUrl: './daycare-questionnaire.component.css'
})
export class DaycareQuestionnaireComponent {
  @ViewChild(ChildRoutineComponent) childRoutineComponent!: ChildRoutineComponent;

  AddSectionForm: FormGroup;
  UserRoleID: any;
  SectionList: any;
  CentreID: any;
  myControlForm!: FormGroup;
  LabelAndControlForm: FormGroup;
  controlFieldForm: FormGroup;
  fields: any[] = [];
  EditSectionForm: FormGroup;
  pleaseSelect!: string; // ! <- this tells that it will be initialized later
  IsValuesControlValid: boolean = false;
  beforeSectionedFields: any[] = [];
  login: any;
  ParticularSectionRecord: any;
  ParticularSectionFields: any;
  controlField: any;
  selectiveValuesArray: any;
  EditingSelectiveValueID: any;
  isEditing: boolean = false;
  ControlOptions: any = [];
  isOptionInputVisibleToAddValues: boolean = false;
  skeletonShow = "Skelton";
  //isValueEmpty: boolean = false;
  constructor(private fb: FormBuilder, private _customService: DaycareQuestionnaireService, private childRoutineService: ChildRoutineService, private cookie: CookieService, private toastr: ToastrService, private cdr: ChangeDetectorRef) {
    this.myControlForm = this.fb.group({
      dynamicFields: this.fb.array([])
    })
    this.LabelAndControlForm = this.fb.group({
      SectionID: ['', [Validators.required]],
      LabelName: ['', [this.requiredNotOnlySpaces()]],
      ControlType: ['', [Validators.required]],
      Values: ['', []],
      Position: [null, [Validators.required]]
    })
    this.AddSectionForm = this.fb.group({
      SectionTitle: ['', [Validators.required]]
    })
    this.EditSectionForm = this.fb.group({
      id: [null, Validators.required],
      SectionNameE: ['', [Validators.required]]
    })
    this.controlFieldForm = this.fb.group({
      id: [null, [Validators.required]],
      labelName: ['', [Validators.required]],
      controlType: ['', [Validators.required]],
      position: [null, [Validators.required]],
      SelectiveValue: [''],
      SectionID: [null, [Validators.required]]
    })

  }

  async ngOnInit() {
    this.login = parseInt(this.cookie.get('UserId'));
    this.UserRoleID = this.cookie.get('UserRoleId');
    this.CentreID = this.cookie.get('CentreID');

    await this.CopyIsMasterTrueSections();
    await this.GetSectionByCentreID();
    await this.GetControlAndLabelForm();

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
    this.ControlOptions = [
      { id: 1, name: 'text' },
      { id: 1, name: 'number' },
      { id: 1, name: 'date' },
      { id: 1, name: 'time' },
      { id: 1, name: 'datetime' },
      { id: 1, name: 'select' },
      { id: 1, name: 'radio' },
      { id: 1, name: 'checkbox' },
      { id: 1, name: 'textarea' }
    ];
  }


  showSelectiveValueInput(event: any) {

    const selectedOption = event.target.value;
    if (selectedOption === "select" || selectedOption === "checkbox" || selectedOption === "radio") {
      $('#options-input').show();
    }
    else {
      $('#options-input').hide();
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


  async GetControlAndLabelForm() {
    try {

      this.skeletonShow = 'Skelton';
      const data = await this.childRoutineService
        .GetControlAndLabelForm(this.CentreID, this.login)
        .toPromise();

      const formattedfields = data.result;

      // Preserve existing values in the form before updating fields
      const currentValues = this.myControlForm?.value || {};

      this.beforeSectionedFields = this.mapApiResponseToFields(formattedfields);

      this.fields = this.SectionList.map((section: any) => {
        return {
          section: section,
          fields: this.beforeSectionedFields.filter(field => field.sectionID === section.id),

        };


      });

      this.skeletonShow = '';

      // Populate form with current values retained
      this.populateForm();

      // Patch the form with previously filled values to avoid clearing
      // this.myControlForm.patchValue(currentValues);

    } catch (e) {
      this.skeletonShow = '';

      console.error('Error getting control and label form data:', e);
    }
  }


  mapApiResponseToFields(apiResponse: any) {


    const inputFields: any[] = [];
    const radioFields: any[] = [];
    const checkboxFields: any[] = [];

    apiResponse.forEach((item: any) => {
      const field: any = {
        id: item.id,
        name: item.label.toLowerCase().replace(/\s+/g, ''), // Create a name from the label
        label: item.label,
        controlType: this.mapControlType(item.controlType),
        value: this.mapDefaultValue(item.controlType), // Set default value based on control type
        sectionID: item.sectionID
      };

      // Add dropdown, checkbox, or radio items if applicable
      if (item.controlType === 'select') {
        field.options = item.dropdownItems.map((option: any) => ({
          label: option.label,
          value: option.value
        }));
        inputFields.push(field); // Add to input fields
      } else if (item.controlType === 'checkbox') {
        field.options = item.checkBoxItems.map((option: any) => ({
          label: option.label,
          value: option.value
        }));
        this.myControlForm.addControl(
          field.name,
          this.fb.array([]) // Initialize as FormArray for checkboxes
        );
        checkboxFields.push(field); // Add to checkbox fields
      } else if (item.controlType === 'radio') {
        field.options = item.radioItems.map((option: any) => ({
          label: option.label,
          value: option.value
        }));
        radioFields.push(field); // Add to radio fields
      } else {
        // Default case for text or number inputs
        inputFields.push(field);
      }
    });

    // Combine fields in the desired order: inputs, radios, checkboxes
    return [...inputFields, ...radioFields, ...checkboxFields];
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
      case 'time':
        return 'time';
      case 'textarea':
        return 'textarea';
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
      case 'time':
        return null;
      case 'textarea':
        return '';
      default:
        return ''; // Default for unknown types
    }
  }

  populateForm() {


    // Initialize the form if it hasn't been set up already
    if (!this.myControlForm) {
      this.myControlForm = this.fb.group({});
    }

    // Iterate through each field and add it to the form, retaining any existing values
    // this.fields.forEach(field => {
    //   // Check if the control already exists
    //   if (!this.myControlForm.contains(field.name)) {
    //     // Add new controls for fields not already in the form
    //     if (field.controlType === 'checkbox') {
    //       this.myControlForm.addControl(field.name, this.fb.array([])); // Initialize as FormArray for checkboxes
    //     } else {
    //       this.myControlForm.addControl(field.name, new FormControl(field.value || ''));
    //     }
    //   }
    // });

    this.fields.forEach(fieldGroup => {
      fieldGroup.fields.forEach((field: any) => {
        // Check if the control already exists
        if (!this.myControlForm.contains(field.name)) {
          // Add new controls for fields not already in the form
          if (field.controlType === 'checkbox') {
            // Initialize as FormArray for checkboxes
            this.myControlForm.addControl(field.name, this.fb.array([]));
          } else {
            // Initialize as FormControl for other types
            this.myControlForm.addControl(field.name, new FormControl(field.value || ''));
          }
        }
      });
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
    if (this.AddSectionForm.valid) {
      let sectionModel = {
        centreID: this.CentreID,
        SectionName: this.AddSectionForm.value.SectionTitle,

      }
      this._customService.SubmitSection(sectionModel).subscribe((data) => {
        if (data.message === "Success") {
          this.toastr.success('Section Added Successfully');
          $('#addSectionModal').modal('hide');
          this.GetSectionByCentreID();

          this.AddSectionForm.reset();
        }
        else if (data.message == "Section Already Exists") {
          this.toastr.info("Section Already Exists");
          this.AddSectionForm.reset();
        }
        else {
          this.toastr.info("Section Already Exists");
          this.AddSectionForm.reset();
        }
      }, (e) => {

      })
    }

  }
  async GetSectionByCentreID() {
    const url = 'questionaire-daycare';
    try {
      const data = await this._customService.GetSectionByCentreID(this.CentreID, url).toPromise();
      if (data.message === "Success") {
        this.SectionList = data.result;
      }
    } catch (e) {
      console.error('Error getting sections by Centre ID:', e);
    }
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
            this.GetControlAndLabelForm();
          }
          else {
            // this.toastr.info("Control Already Exists");
            this.toastr.info(data.message);
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
            this.GetControlAndLabelForm();
          }
          else {
            // this.toastr.info("Control Already Exists");
            this.toastr.info(data.message);
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


  ActiveInActiveSections(sectionId: any, event: any) {
    // if uncheck means wants to inactive
    const iconElement = event.target as HTMLElement;
    const iconElementValue = iconElement.className;
    if (iconElementValue == "fa fa-eye") {
      let model = {
        sectionId: sectionId,
        wantToActive: false
      }
      this._customService.ActiveInActiveSections(model).subscribe((data) => {
        if (data.message === "Section InActivated Successfully") {

          this.CopyIsMasterTrueSections();
          this.GetSectionByCentreID();
          this.GetControlAndLabelForm();

          this.toastr.success("Section Deactivated Successfully");
        }
      }, (e) => { })
    }
    else {
      let model = {
        sectionId: sectionId,
        wantToActive: true
      }
      this._customService.ActiveInActiveSections(model).subscribe((data) => {
        if (data.message === "Section Activated Successfully") {

          this.CopyIsMasterTrueSections();
          this.GetSectionByCentreID();
          this.GetControlAndLabelForm();
          this.toastr.success("Section Activated Successfully");
        }
      }, (e) => { })
    }
  }
  // ActiveInActiveSections(sectionId: any, event: any) {
  //   // if uncheck means wants to inactive

  //   if (!event.target.checked) {
  //     let model = {
  //       sectionId: sectionId,
  //       wantToActive: false
  //     }
  //     this._customService.ActiveInActiveSections(model).subscribe((data) => {
  //       if (data.message === "Section InActivated Successfully") {
  //         this.toastr.success("Section Deactivated Successfully");
  //       }
  //     }, (e) => { })
  //   }
  //   else {
  //     let model = {
  //       sectionId: sectionId,
  //       wantToActive: true
  //     }
  //     this._customService.ActiveInActiveSections(model).subscribe((data) => {
  //       if (data.message === "Section Activated Successfully") {
  //         this.toastr.success("Section Activated Successfully");
  //       }
  //     }, (e) => { })
  //   }

  // }
  async CopyIsMasterTrueSections() {
    try {
      const data = await this._customService
        .CopyIsMasterTrueSections(this.CentreID, this.login, this.UserRoleID)
        .toPromise();
      if (data.message === "Success") {
      }
    } catch (e) {
      console.error('Error copying master sections:', e);
    }
  }
  // async CopyIsMasterTrueSections(){
  //   let record = await this._customService.CopyIsMasterTrueSections(this.CentreID,this.login,this.UserRoleID).toPromise();
  //    if(record.message === "Success"){
  //     let sectionLists = record.result;
  //    }

  // }
  // async copyMasterSectionsAndFieldsAsync(){
  //   await this.CopyIsMasterTrueSections();
  // }


  GetSectionByIDAndCentreID(id: number) {
    this._customService.GetSectionByIDAndCentreID(id, this.CentreID).subscribe((data) => {
      if (data.message === "Success") {
        this.ParticularSectionRecord = data.result;
        this.ParticularSectionFields = data.result.fields;
        this.EditSectionForm.patchValue({
          id: this.ParticularSectionRecord.id,
          SectionNameE: this.ParticularSectionRecord.name
        })
        $('#edit-section-modal').modal('show');
      }
    }, (e) => { })

  }

  GetControlFieldById(id: number) {
    this._customService.GetControlFieldById(id).subscribe((data) => {
      if (data.message === "Success") {
        this.controlField = data.result;
        this.selectiveValuesArray = data.result.selectValues;
        this.controlFieldForm.patchValue({
          id: this.controlField.id,
          labelName: this.controlField.labelName,
          controlType: this.controlField.controlType,
          position: this.controlField.positionIndex,
          SectionID: this.controlField.sectionID
        })
        $('#edit-control-field').modal('show');
      }
    }, (e) => { })
  }

  onEditSubmitSection() {
    if (this.EditSectionForm.valid) {
      let sectionModel = {
        SectionID: this.EditSectionForm.value.id,
        SectionName: this.EditSectionForm.value.SectionNameE
      }

      this._customService.SubmitEditedSection(sectionModel).subscribe((data) => {
        if (data.message === "Success") {

          this.CopyIsMasterTrueSections();
          this.GetSectionByCentreID();
          this.GetControlAndLabelForm();

          this.toastr.success('Section Edited Successfully');
        }
      }, (e) => { })
    }
  }

  EditParticularSelectiveValue(id: any, selectiveValue: string) {
    this.isEditing = true;
    this.EditingSelectiveValueID = id;
    this.controlFieldForm.patchValue({
      SelectiveValue: selectiveValue
    });
  }
  SaveEditedSelectiveValue(id: any, selectiveValue: string) {
    if (selectiveValue !== "") {
      let model = {
        id: id,
        selectiveValue: selectiveValue
      }
      this._customService.SaveEditedSelectiveValue(model).subscribe((data) => {
        if (data.message === "Success") {

          const index = this.selectiveValuesArray.findIndex((i: any) => i.id === id);
          if (index !== -1) {
            this.selectiveValuesArray[index].values = selectiveValue;
          }
          this.isEditing = false;
          this.EditingSelectiveValueID = null;
          this.cdr.detectChanges();
          this.CopyIsMasterTrueSections();
          this.GetSectionByCentreID();
          this.GetControlAndLabelForm();
          this.toastr.success("value edited successfully");
        }
      }, (e) => { })
    }
  }

  ActiveOrInActiveControlField(id: any, event: any) {
    if (!event.target.checked) {
      let model = {
        controlID: id,
        wantToActive: false
      }
      this._customService.ActiveOrInActiveControlField(model).subscribe((data) => {
        if (data.message === "Control DeActivated Successfully") {
          this.toastr.success('Control DeActivated Successfully');
          this.CopyIsMasterTrueSections();
          this.GetSectionByCentreID();
          this.GetControlAndLabelForm();
        }
      }, (e) => { })
    }
    else {
      let model = {
        controlID: id,
        wantToActive: true
      }
      this._customService.ActiveOrInActiveControlField(model).subscribe((data) => {
        if (data.message === "Control Activated Successfully") {
          this.toastr.success('Control Activated Successfully');
          this.CopyIsMasterTrueSections();
          this.GetSectionByCentreID();
          this.GetControlAndLabelForm();
        }
      }, (e) => { })
    }
  }





  ActiveOrInActiveSelectiveValue(id: any, event: any) {
    if (!event.target.checked) {
      let model = {
        SelectiveValueID: id,
        wantToActive: false
      }
      this._customService.ActiveOrInActiveSelectiveValue(model).subscribe((data) => {
        if (data.message === "Section DeActivated Successfully") {
          this.toastr.success('Section DeActivated Successfully');
          this.CopyIsMasterTrueSections();
          this.GetSectionByCentreID();
          this.GetControlAndLabelForm();
        }
      }, (e) => { })
    }
    else {
      let model = {
        SelectiveValueID: id,
        wantToActive: true
      }
      this._customService.ActiveOrInActiveSelectiveValue(model).subscribe((data) => {
        if (data.message === "Section Activated Successfully") {
          this.toastr.success('Section Activated Successfully');
          this.CopyIsMasterTrueSections();
          this.GetSectionByCentreID();
          this.GetControlAndLabelForm();
        }
      }, (e) => { })
    }
  }

  SubmitEditedControlField() {
    this.controlFieldForm.value;
    if (this.controlFieldForm.valid) {
      let model = {
        id: this.controlFieldForm.value.id,
        labelName: this.controlFieldForm.value.labelName,
        controlType: this.controlFieldForm.value.controlType
      }
      this._customService.SubmitEditedControlField(model).subscribe((data) => {
        if (data.message === "Success") {
          this.GetSectionByIDAndCentreID(this.controlFieldForm.value.SectionID);
          this.CopyIsMasterTrueSections();
          this.GetSectionByCentreID();
          this.GetControlAndLabelForm();
          this.toastr.success('Control field updated successfully');
        }
      }, (e) => { })
    }
  }

  OnselectedOption(optionValue: any) {
    if (optionValue === "select" || optionValue === "radio" || optionValue === "checkbox") {
      this.isOptionInputVisibleToAddValues = true;
    }
    else {
      this.isOptionInputVisibleToAddValues = false;
    }
  }
}
