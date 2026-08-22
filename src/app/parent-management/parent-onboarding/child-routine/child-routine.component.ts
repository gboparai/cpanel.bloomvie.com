import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ChildRoutineService } from './child-routine.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Route, Router, RouterLink } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { CookieService } from 'ngx-cookie-service';

import Swal from 'sweetalert2';
import { rejects } from 'node:assert';
import { DaycareQuestionnaireService } from '../../../daycare-questionnaire/daycare-questionnaire.service';
import { commaSeparatedValidator } from '../../../toc-registration/toc-registration.component';
import { retry } from 'rxjs';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { CommonService } from '../../../common-component/common.service';
declare var $: any;

@Component({
  selector: 'app-child-routine',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    NgSelectModule,
    FormsModule,
  ],
  templateUrl: './child-routine.component.html',
  styleUrl: './child-routine.component.css',
})
export class ChildRoutineComponent {
  dailyRoutineForm: FormGroup;
  studentID: any;
  login: any;
  AddSectionForm: FormGroup;
  sectionedFields: any[] = [];
  //Arsh
  myControlForm!: FormGroup;
  LabelAndControlForm: FormGroup;
  fields: any[] = [];
  beforeSectionedFields: any[] = [];

  pleaseSelect!: string; // ! <- this tells that it will be initialized later
  IsValuesControlValid: boolean = false;
  DynamicFormCount: number = 0;
  userRoleID: any;
  CentreID: any;
  DynamicSectionList: any;
  parentBelongsToCentre: any;
  answersOfControlRecord: any[] = [];
  answers: any;
  updateCase: boolean = false;
  parentID: number = 0;
  pendingStudentOnboarding: any[] = [];
  selectStudent: any;
  teacherID: number = 0;

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private childRoutineService: ChildRoutineService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private cookie: CookieService,
    private _customService: DaycareQuestionnaireService,
    private commonService: CommonService
  ) {
    this.dailyRoutineForm = this.fb.group({
      studentID: 0,
      preferredNapTime: ['', Validators.required],
      specificSleepNeeds: ['', Validators.required],
      favouriteMeals: [''],
      snackPreference: [''],
      foodAllergy: [''],
      childPottyTrained: [],
      assistanceNeeded: [],
      likes: [''],
      dislikes: [''],
      otherInstructions: [''],
      userID: 0,
    });

    this.AddSectionForm = this.fb.group({
      SectionTitle: ['', Validators.required],
    });

    this.myControlForm = this.fb.group({
      dynamicFields: this.fb.array([]),
    });

    this.LabelAndControlForm = this.fb.group({
      SectionID: ['', Validators.required],
      LabelName: ['', [this.requiredNotOnlySpaces()]],
      ControlType: ['', [Validators.required]],
      Values: ['', []],
      Position: [null],
    });
  }

  async ngOnInit() {
    let userRoleID = parseInt(this.cookie.get('UserRoleId'));
    if (userRoleID != 4) {
      this.login = parseInt(this.cookie.get('UserId'));
    } else {
      this.teacherID = parseInt(this.cookie.get('UserId'));
      this.login = parseInt(this.cookie.get('ParentID'));
    }

    this.studentID = parseInt(this.cookie.get('StudentID'));
    const data = JSON.parse(this.cookie.get('UserInfo'));
    if (data.result.centreID != null && data.result.centreID !== 0) {
      this.parentBelongsToCentre = data.result.centreID;
    } else {
      this.parentBelongsToCentre = this.cookie.get('CentreID');
    }
    this.userRoleID = this.cookie.get('userRoleID');
    if (!this.userRoleID) {
      this.userRoleID = this.cookie.get('UserRoleId');
    }

    if (this.cookie.get('Update') == 'true') {
      this.updateCase = true;
      this.cookie.delete('Update');
    } else {
      this.updateCase = false;
      this.cookie.delete('Update');
    }

    this.CentreID = this.cookie.get('CentreID');
    this.route.queryParams.subscribe((params) => {
      const encryptedstudentID = params['studentID'];
      const encryptedParentID = params['parentID'];
      if (encryptedstudentID && encryptedParentID) {
        const secretKey = 'encrypt001100!?';
        const decryptedBytesStudentID = CryptoJS.AES.decrypt(
          encryptedstudentID,
          secretKey
        );
        this.studentID = parseInt(
          decryptedBytesStudentID.toString(CryptoJS.enc.Utf8),
          10
        );

        const decryptedBytesParentID = CryptoJS.AES.decrypt(
          encryptedParentID,
          secretKey
        );
        this.parentID = parseInt(
          decryptedBytesParentID.toString(CryptoJS.enc.Utf8),
          10
        );
      }
      this.SetUserIDAndStudentID();
      this.getStudentLikesAndDislikes();
    });

    await this.CopyIsMasterTrueSections();
    await this.GetSectionByCentreID();
    await this.GetControlAndLabelForm();

    //this.copyMasterSectionsAndFieldsAsync();

    //await this.CopyIsMasterTrueSections();

    await this.GetSectionByCentreID();

    //Arsh
    await this.GetControlAndLabelForm();
    const fieldTypeSelect = document.getElementById(
      'field-type'
    ) as HTMLSelectElement;
    const OptionsInput = document.getElementById(
      'options-input'
    ) as HTMLElement;
    const inputFieldContainer = document.getElementById(
      'input-field-container'
    ) as HTMLElement;

    if (fieldTypeSelect && OptionsInput && inputFieldContainer) {
      fieldTypeSelect.addEventListener('change', () => {
        // Clear previous input fields
        inputFieldContainer.innerHTML = '';

        // Display dropdown options if 'dropdown' is selected
        if (
          fieldTypeSelect.value === 'select' ||
          fieldTypeSelect.value === 'checkbox' ||
          fieldTypeSelect.value === 'radio'
        ) {
          OptionsInput.style.display = 'block';

          const addFieldButton = document.getElementById(
            'addFieldButton'
          ) as HTMLButtonElement;
          // addFieldButton.disabled = true;

          const valuesControl = this.LabelAndControlForm.get('Values');
          valuesControl?.clearValidators();
        } else {
          OptionsInput.style.display = 'none';
        }
      });
    }
  }

  startAnotherKidOnboarding() {
    $('#PendingOnboardStudent').modal('hide');
    this.cookie.set('StudentID', this.selectStudent.studentID);

    let encryptedOrderNumber = this.commonService.encrypt(
      this.selectStudent.orderNumber
    );
    let encryptedStudentID = this.commonService.encrypt(
      this.selectStudent.studentID
    );
    let token = this.selectStudent.token;

    this.router.navigate(['/welcome'], {
      queryParams: {
        StudentID: encryptedStudentID,
        orderNumber: encryptedOrderNumber,
        token: token,
      },
    });

    // const  childRoutineTab= document.getElementById(
    //   'child-routine'
    // );
    // const parentDetailsTab = document.getElementById('child-parent-basic-deatils');

    // if (parentDetailsTab && childRoutineTab) {
    //   parentDetailsTab.classList.add('active');
    //   childRoutineTab.classList.remove('active');
    // }
  }

  selectStudentFromList(event: any) {
    if (event) {
      this.selectStudent = event;
    } else {
      this.selectStudent = null;
    }
  }

  getStudentLikesAndDislikes() {
    this.childRoutineService
      .getStudentLikesAndDislikes(this.login, this.studentID)
      .subscribe(
        (data) => {
          if (data.message === 'Success') {
            this.answersOfControlRecord = data.result.map(
              (item: any) => item.answers
            );
          }
        },
        (error) => {}
      );
  }

  async CopyIsMasterTrueSections() {
    try {
      const data = await this._customService
        .CopyIsMasterTrueSections(
          this.parentBelongsToCentre,
          this.login,
          this.userRoleID
        )
        .toPromise();
      if (data.message === 'Success') {
      }
    } catch (e) {
      console.error('Error copying master sections:', e);
    }
  }
  OpenSectionModal() {
    $('#addSectionModal').modal('show');
  }
  // added on 07/11/2024

  async GetSectionByCentreID() {
    let url = 'parent-onboarding';
    const data = await this.childRoutineService
      .getSectionByCentreID(this.parentBelongsToCentre, url)
      .toPromise();
    if (data.message === 'Success') {
      this.DynamicSectionList = data.result;
    }
  }

  onSubmitSectionForm() {
    let sectionModel = {
      centreID: this.CentreID,
      SectionName: this.AddSectionForm.value.SectionTitle,
    };
    this.childRoutineService.SubmitSection(sectionModel).subscribe(
      (data) => {
        if (data.message === 'Success') {
          this.toastr.success('Section Added Successfully');
          this.GetSectionByCentreID();
          this.GetControlAndLabelForm();
          this.AddSectionForm.reset();
        } else if (data.message == 'Section Already Exists') {
          this.toastr.info('Section Already Exists');
        }
      },
      (e) => {}
    );
  }

  SetUserIDAndStudentID() {
    this.dailyRoutineForm.patchValue({
      studentID: this.studentID,
      userID: this.login,
    });
  }

  onSubmit() {
    if (!this.dailyRoutineForm.valid) {
      const dailyRoutineData = {
        studentID: this.studentID,
        userID: this.login,

        ...this.dailyRoutineForm.value,
      };

      const dynamicFormData = this.fields
        .map((fieldGroup) => {
          // We are now working with fieldGroup.fields which is an array of fields inside each group
          return fieldGroup.fields
            .map((field: any) => {
              const fieldValue = this.myControlForm.value[field.name];

              // Check if the field has a value and if it's valid (non-empty or array with elements)
              if (
                fieldValue &&
                (Array.isArray(fieldValue)
                  ? fieldValue.length > 0
                  : fieldValue !== '')
              ) {
                return {
                  controlLabelId: field.id, // The field's ID
                  value: Array.isArray(fieldValue)
                    ? fieldValue
                    : [String(fieldValue)], // Ensure value is in an array format
                  field: field, // Include the entire field object (label, type, etc.)
                };
              }
              return null; // If no value, return null
            })
            .filter((item: any) => item !== null); // Filter out any null items
        })
        .flat(); // Use flat() to merge the nested arrays into a single array

      const combinedData = {
        UserRole: Number(this.userRoleID),
        UserID: Number(this.login),
        StudentID: this.studentID,
        TeacherID: this.teacherID ? this.teacherID : 0,
        DynamicForm: dynamicFormData.length > 0 ? dynamicFormData : null,
      };

      //Prabhjot Singh added on 31-01-2025
      // interface AnswerRecord {
      //   controlLabelID: number;
      //   answer: string;
      // }

      // const flattenedRecords: AnswerRecord[] = this.fields.flat();

      // const updaterecord: any[] = [];

      // flattenedRecords.forEach((item: AnswerRecord) => {

      //   if (item && item.controlLabelID !== undefined && item.answer !== undefined) {
      //     updaterecord.push({
      //       controlLabelId: item.controlLabelID,
      //       value: item.answer
      //     });
      //   }
      // });

      // const combinedData = {
      //   UserRole: Number(this.userRoleID),
      //   UserID: Number(this.login),
      //   DynamicForm: updaterecord
      // };

      this.spinner.show();

      this.childRoutineService.submitCombinedData(combinedData).subscribe({
        next: (response) => {
          if (response.message === 'Success') {
            this.toastr.success('Data submitted successfully');
            if (this.updateCase == true) {
              Swal.fire({
                title: 'Data Saved!',
                text: 'Child routine Information updated Successfully . ',
                icon: 'success',
                confirmButtonText: 'Okay',
              }).then(() => {
                this.cookie.set('Component', 'Dashboard');
                if (!this.teacherID) {
                  this.router.navigate(['/parent-dashboard']);
                } else {
                  this.cookie.delete('StudentID');
                  this.cookie.delete('ParentID');
                  this.router.navigate(['/teachers-dashboard']);
                }
              });
            } else {
              //add api call here

              this.childRoutineService
                .getAllPendingOnboardingStudentByCentreIDAndParentID(
                  this.parentBelongsToCentre,
                  this.login
                )
                .subscribe((data: any) => {
                  if (data.message == 'Success') {
                    Swal.fire({
                      title: 'Data Saved!',
                      text: "Thank you! We've received your information. you want start Onboarding for Another Student ?",
                      icon: 'info',
                      confirmButtonText: 'Start Onboarding',
                      showConfirmButton: true,
                      showCancelButton: true,
                      cancelButtonText: 'go to Dashboard',
                    }).then((response: any) => {
                      if (response.isConfirmed) {
                        this.pendingStudentOnboarding = data.result;
                        $('#PendingOnboardStudent').modal('show');
                      } else if (response.isDismissed) {
                        this.cookie.set('Component', 'Dashboard');
                        this.router.navigate(['/parent-dashboard']);
                      }
                    });
                  } else {
                    Swal.fire({
                      title: 'Data Saved!',
                      text: "Thank you! We've received your information. We'll email you once a class is assigned to your child.",
                      icon: 'success',
                      confirmButtonText: 'Okay',
                    }).then(() => {
                      this.cookie.set('Component', 'Dashboard');
                      this.router.navigate(['/parent-dashboard']);
                    });
                  }
                });
            }
          } else {
            this.toastr.error('Failed to submit data');
          }
        },
        error: (error) => {
          console.error('Error submitting data:', error);
          this.toastr.error('An error occurred while submitting');
        },
        complete: () => {
          this.spinner.hide();
        },
      });
    } else {
      this.toastr.error('Please fill all required fields in the main form');
      this.dailyRoutineForm.markAllAsTouched();
    }
  }

  async GetControlAndLabelForm() {
    var data = await this.childRoutineService
      .GetControlAndLabelForm(this.parentBelongsToCentre, this.login)
      .toPromise();
    const formattedfields = data.result;

    // Preserve existing values in the form before updating fields
    const currentValues = this.myControlForm?.value || {};

    const waitForSections = () =>
      new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (this.DynamicSectionList && this.DynamicSectionList.length > 0) {
            clearInterval(checkInterval);
            this.commonService.loadStep2.set(true);
            resolve(true);
          } else {
            
          }
        }, 100);
      });
    await waitForSections();

    this.beforeSectionedFields = this.mapApiResponseToFields(formattedfields);

    this.fields = this.DynamicSectionList.map((section: any) => {
      return {
        section: section,
        fields: this.beforeSectionedFields.filter(
          (field) => field.sectionID === section.id
        ),
      };
    });

    // Set DynamicFormCount after fields update
    this.DynamicFormCount = this.fields.length;

    // Populate form with current values retained

    this.populateForm();

    // Patch the form with previously filled values to avoid clearing
    this.myControlForm.patchValue(currentValues);
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
        sectionID: item.sectionID,
      };

      // Add dropdown, checkbox, or radio items if applicable
      if (item.controlType === 'select') {
        field.options = item.dropdownItems.map((option: any) => ({
          label: option.label,
          value: option.value,
        }));
        inputFields.push(field); // Add to input fields
      } else if (item.controlType === 'checkbox') {
        field.options = item.checkBoxItems.map((option: any) => ({
          label: option.label,
          value: option.value,
          id: option.id,
        }));
        this.myControlForm.addControl(
          field.name,
          this.fb.array([]) // Initialize as FormArray for checkboxes
        );
        checkboxFields.push(field); // Add to checkbox fields
      } else if (item.controlType === 'radio') {
        field.options = item.radioItems.map((option: any) => ({
          label: option.label,
          value: option.value,
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

  //Added on 11-5-24

  populateForm_Sahib_Backup_28_01_2025() {
    // Initialize the form if it hasn't been set up already
    if (!this.myControlForm) {
      this.myControlForm = this.fb.group({});
    }

    this.fields.forEach((fieldGroup) => {
      fieldGroup.fields.forEach((field: any) => {
        // Check if the control already exists
        if (!this.myControlForm.contains(field.name)) {
          // Add new controls for fields not already in the form
          if (field.controlType === 'checkbox') {
            // Initialize as FormArray for checkboxes
            this.myControlForm.addControl(field.name, this.fb.array([]));
          } else {
            // Initialize as FormControl for other types
            this.myControlForm.addControl(
              field.name,
              new FormControl(field.value || '')
            );
          }
        }
      });
    });
  }

  populateForm_Again_Backup() {
    if (!this.myControlForm) {
      this.myControlForm = this.fb.group({});
    }
    this.fields.forEach((fieldGroup) => {
      fieldGroup.fields.forEach((field: any) => {
        if (!this.myControlForm.contains(field.name)) {
          if (field.controlType === 'checkbox') {
            this.myControlForm.addControl(field.name, this.fb.array([]));
          } else {
            let matchFound = false;
            this.answersOfControlRecord.forEach((item: any) => {
              item.forEach((AnswerControlLabel: any) => {
                if (
                  field.id === AnswerControlLabel.controlLabelID &&
                  AnswerControlLabel.answer !== ''
                ) {
                  this.myControlForm.addControl(
                    field.name,
                    new FormControl(AnswerControlLabel.answer)
                  );
                  matchFound = true;
                  return;
                }
              });
              if (matchFound) return;
            });
            if (!matchFound) {
              this.myControlForm.addControl(field.name, new FormControl(''));
            }
          }
        }
      });
    });
  }

  //Commneted on 06/03/25
  populateForm() {
    if (!this.myControlForm) {
      this.myControlForm = this.fb.group({});
    }
    this.fields.forEach((fieldGroup) => {
      fieldGroup.fields.forEach((field: any) => {
        if (!this.myControlForm.contains(field.name)) {
          if (field.controlType === 'checkbox') {
            // this.myControlForm.addControl(field.name, this.fb.array([]));
          } else {
            let matchFound = false;
            this.answersOfControlRecord.forEach((item: any) => {
              item.forEach((AnswerControlLabel: any) => {
                if (
                  field.id === AnswerControlLabel.controlLabelID &&
                  AnswerControlLabel.answer !== ''
                ) {
                  this.myControlForm.addControl(
                    field.name,
                    new FormControl(AnswerControlLabel.answer)
                  );
                  matchFound = true;
                  return;
                }
              });
              if (matchFound) return;
            });
            if (!matchFound) {
              this.myControlForm.addControl(field.name, new FormControl(''));
            }
          }
        }
      });
    });
  }

  //Added by Arshdeep on 06/03/25
  // populateForm() {
  //   if (!this.myControlForm) {
  //     this.myControlForm = this.fb.group({});
  //   }

  //   this.fields.forEach((fieldGroup) => {
  //     fieldGroup.fields.forEach((field: any) => {
  //       if (!this.myControlForm.contains(field.name)) {
  //         if (field.controlType === 'checkbox') {
  //           // Initialize FormArray for checkboxes
  //           const formArray = this.fb.array([]);

  //           // Check if any value was previously selected and patch it
  //           this.answersOfControlRecord.forEach((item: any) => {
  //             item.forEach((AnswerControlLabel: any) => {
  //               if (field.id === AnswerControlLabel.controlLabelID && AnswerControlLabel.answer !== "") {
  //                 formArray.push(new FormControl(AnswerControlLabel.answer));
  //               }
  //             });
  //           });

  //           this.myControlForm.addControl(field.name, formArray);

  //         } else {
  //           let matchFound = false;
  //           this.answersOfControlRecord.forEach((item: any) => {
  //             item.forEach((AnswerControlLabel: any) => {
  //               if (field.id === AnswerControlLabel.controlLabelID && AnswerControlLabel.answer !== "") {
  //                 this.myControlForm.addControl(field.name, new FormControl(AnswerControlLabel.answer));
  //                 matchFound = true;
  //                 return;
  //               }
  //             });
  //             if (matchFound) return;
  //           });
  //           if (!matchFound) {
  //             this.myControlForm.addControl(field.name, new FormControl(''));
  //           }
  //         }
  //       }
  //     });
  //   });
  // }

  // Commented on 06/03/25
  // onCheckboxChange(event: any, value: string, controlName: string) {
  //   const formArray: FormArray = this.myControlForm.get(controlName) as FormArray;

  //   if (event.target.checked) {
  //     formArray.push(new FormControl(value));

  //   } else {
  //     const index = formArray.controls.findIndex((ctrl) => ctrl.value === value);
  //     if (index !== -1) {
  //       formArray.removeAt(index);  // Remove value if unchecked
  //     }
  //   }
  // }

  //Added by Arshdeep on 06/02/25
  getAnswerByFieldName(fieldName: string): string | null {
    if (
      !Array.isArray(this.answersOfControlRecord) ||
      this.answersOfControlRecord.length === 0
    ) {
      return null;
    }

    const normalizedFieldName = fieldName.toLowerCase().trim();
    const record = this.answersOfControlRecord[0].find((item: any) => {
      return (
        item.controlLabelName?.toLowerCase().trim() === normalizedFieldName
      );
    });

    if (!record) {
      return null;
    }
    return record.answer;
  }

  onCheckboxChange(event: any, value: any, controlName: string) {
    // const answer = this.getAnswerByFieldName(fieldName) || ""; // Ensure answer is always a string
    let formArray: FormArray = this.myControlForm.get(controlName) as FormArray;
    if (!formArray) {
      this.myControlForm.addControl(controlName, this.fb.array([]));
      formArray = this.myControlForm.get(controlName) as FormArray;
    }

    //Update case
    if (this.answersOfControlRecord.length > 0) {
      if (event.target.checked) {
        const answer = this.getAnswerByFieldName(controlName) || '';
        if (!formArray.value.includes(value)) {
          formArray.push(new FormControl(value));
        }
        answer.split(',').forEach((ans) => {
          if (ans.trim() && !formArray.value.includes(ans.trim())) {
            formArray.push(new FormControl(ans.trim()));
          }
        });
      } else {
        if (formArray.value.length == 0) {
          this.myControlForm.addControl(controlName, this.fb.array([]));
          formArray = this.myControlForm.get(controlName) as FormArray;
          const answer = this.getAnswerByFieldName(controlName) || '';
          const updatedValues = answer
            .split(',')
            .map((v) => v.trim())
            .filter((v) => v !== value);
          updatedValues.forEach((v) => formArray.push(new FormControl(v)));
        } else {
          const index = formArray.controls.findIndex(
            (ctrl) => ctrl.value === value
          );
          if (index !== -1) {
            formArray.removeAt(index);
          }
        }
      }
    }

    //Addition Case
    else {
      // if (event.target.checked) {
      //   if (!formArray.value.includes(value)) {
      //     formArray.push(new FormControl(value));
      //   }
      // } else {
      //   const index = formArray.controls.findIndex((ctrl) => ctrl.value === value);
      //   if (index !== -1) {
      //     formArray.removeAt(index);
      //   }
      // }
      const formArray: FormArray = this.myControlForm.get(
        controlName
      ) as FormArray;

      if (event.target.checked) {
        formArray.push(new FormControl(value));
      } else {
        const index = formArray.controls.findIndex(
          (ctrl) => ctrl.value === value
        );
        if (index !== -1) {
          formArray.removeAt(index); // Remove value if unchecked
        }
      }
    }
  }

  ResetForm() {
    this.LabelAndControlForm.reset({
      LabelName: '',
      ControlType: '',
      Values: '',
      Position: null,
    });
    $('#Custom-form').modal('show');
  }

  // for disable button, it returns true if the value is not empty
  areFieldsFilled(): boolean {
    const { LabelName, ControlType, Position } = this.LabelAndControlForm.value;
    return (
      LabelName.trim() !== '' &&
      ControlType.trim() !== '' &&
      Position !== null &&
      Position !== undefined
    );
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

  onSubmitDynamicForm() {
    const formValue = this.myControlForm.value;
    const submittedData = this.fields.map((field) => {
      const fieldValue = formValue[field.name];

      return {
        controlLabelId: field.id,
        // Ensure value is sent as an array of strings
        value: Array.isArray(fieldValue) ? fieldValue : [String(fieldValue)],
      };
    });

    // Submit the formatted data to the backend
    this.childRoutineService.SubmitControlFieldAnswers(submittedData).subscribe(
      (response) => {
        if (response.message === 'Success') {
          this.toastr.success('Data submitted successfully');
        }
      },
      (error) => {
        console.error('Error submitting data:', error);
      }
    );
  }

  checkBoxStateManager(value: any, controlName: string): boolean {
    let checkboxTypeAnswers: any = [];
    for (const answer of this.answersOfControlRecord) {
      for (const ans of answer) {
        if (ans.controlType === 'checkbox') {
          checkboxTypeAnswers.push(ans);
        }
      }
    }
    for (const element of checkboxTypeAnswers) {
      const answerArray = element.answer.split(',');
      if (answerArray.includes(value)) {
        // const formArray: FormArray = this.myControlForm.get(controlName) as FormArray;
        // formArray.push(new FormControl(value));
        return true;
      }
    }
    return false;
  }
}
