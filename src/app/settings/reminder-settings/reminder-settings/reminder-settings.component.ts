import { Component, OnInit } from '@angular/core';
import { BreadcrumbComponent } from '../../../common-component/breadcrumb/breadcrumb.component';
import { RemidnerSettingsService } from './remidner-settings.service';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { UserRoleService } from '../../Permission/user-role/user-role.service';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { NgFor, NgIf } from '@angular/common';
import { SwitcherComponentComponent } from '../../../common-component/switcher-component/switcher-component.component';
import { Console } from 'console';
import { SkeletonLoaderComponent } from "../../../common-component/skeleton-loader/skeleton-loader.component";
@Component({
  selector: 'app-reminder-settings',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    FormsModule,
    ReactiveFormsModule,
    SwitcherComponentComponent,
    NgSelectModule,
    NgFor,
    NgIf,
    SkeletonLoaderComponent
  ],
  templateUrl: './reminder-settings.component.html',
  styleUrls: ['./reminder-settings.component.css'],
})
export class ReminderSettingsComponent implements OnInit {
  reminderForm: any;
  ReminderTypeList: any[] = [];
  selectedReminderID: any;
  UserRoleList: any;
  selectedToId: any;
  selectedToCC: any;
  UserroleID: any;
  UserID: any;
  centreID: any;
  reminderList: any[] = [];
  ToUserRoleList: any[] = [];
  reminderSubList: any[] = [];
  checkReminder: number = 0;
  skeletonShow = 'Skelton';


  constructor(
    private reminderService: RemidnerSettingsService,
    private formGroup: FormBuilder,
    private userroleService: UserRoleService,
    private cookie: CookieService,
    private spinner: NgxSpinnerService,
    private toaster: ToastrService
  ) {
    this.reminderForm = this.formGroup.group({
      id: [0],
      daycareCentreID: [0],
      toUserTypeID: [0, [Validators.required]],
      ccUserTypeID: [0, [Validators.required]],
      reminderTypeID: [0, [Validators.required]],
      reminderSubject1: [''],
      reminderBody1: [''],
      reminderSubject2: [''],
      reminderBody2: [''],
      reminderSubject3: [''],
      reminderBody3: [''],
      reminder1DaysBefore: [0],
      reminder2DaysBefore: [0],
      reminder3DaysBefore: [0],
      createdBy: [0],
      isMonthly_Yearly: ['Monthly', [Validators.required]],
    });
  }

  async ngOnInit() {

    this.UserroleID = this.cookie.get('UserRoleId');
    this.UserID = this.cookie.get('UserId');
    this.centreID = this.cookie.get('CentreID');
    await this.getReminderType();
    this.getAllUserRole();
    await this.getAllReminderByCenterID();
  }

  getPatchedValue(reminder: any) {

    this.reminderForm.patchValue({
      id: reminder.id,
      toUserTypeID: reminder.toUserTypeID,
      ccUserTypeID: reminder.ccUserTypeID,
      reminderTypeID: reminder.reminderTypeID,
      reminder1DaysBefore: reminder.reminder1DaysBefore,
      reminderSubject1: reminder.reminderSubject1,
      reminderBody1: reminder.reminderBody1,
      reminder2DaysBefore: reminder.reminder2DaysBefore,
      reminderSubject2: reminder.reminderSubject2,
      reminderBody2: reminder.reminderBody2,
      reminder3DaysBefore: reminder.reminder3DaysBefore,
      reminderSubject3: reminder.reminderSubject3,
      reminderBody3: reminder.reminderBody3,
      isMonthly_Yearly: reminder.isMonthly_Yearly,
    });
  }

  addreminderValues() {

    if (this.reminderForm.valid) {
      this.spinner.show();
      if (this.reminderForm.value.id == 0) {
        this.reminderForm.patchValue({
          reminderTypeID: this.selectedReminderID,
          toUserTypeID: this.selectedToId,
          ccUserTypeID: this.selectedToCC,
          createdBy: this.UserID,
          daycareCentreID: this.UserroleID == 1 ? 0 : this.centreID,
        });
        this.reminderService
          .addReminderSettings(this.reminderForm.value)
          .subscribe(async (data) => {
            if (data.message == 'OK') {
              setTimeout(() => {
                this.spinner.hide();
              }, 100);
              this.toaster.success('Reminder Settings Added Succeessfully');
              await this.getAllReminderByCenterID();
              this.reminderForm.reset();
            }
          });
      } else {
        this.reminderForm.patchValue({
          // reminderTypeID: this.selectedReminderID,
          // toUserTypeID: this.selectedToId,
          // ccUserTypeID: this.selectedToCC,
          createdBy: this.UserID,
          daycareCentreID: this.UserroleID == 1 ? 0 : this.centreID,
        });

        this.reminderService
          .addReminderSettings(this.reminderForm.value)
          .subscribe(async (data) => {
            if (data.message == 'OK') {
              this.toaster.success('Reminder Settings updated Succeessfully');
              await this.getAllReminderByCenterID();
              this.reminderForm.reset();
              setTimeout(() => {
                this.spinner.hide();
              }, 100);
            }
          });
      }
    } else {
      this.reminderForm.markAsTouched();
    }
  }

  async getAllReminderByCenterID() {

    this.skeletonShow = 'Skelton';

    this.checkReminder = 0;
    this.reminderSubList = [];
    let data = await this.reminderService
      .getAllReminderByCenterID(this.centreID)
      .toPromise();
    if (data.message == 'Success') {
      this.reminderList = data.result;
      this.skeletonShow = '';
    }
  }

  getOtherReminderList(reminder: any) {

    this.skeletonShow = 'Skelton';


    this.reminderSubList = [];
    if (
      reminder.reminderSubject2 != '' ||
      reminder.reminderSubject2 != null ||
      reminder.reminderBody2 != '' ||
      reminder.reminderBody2 != null ||
      reminder.reminder2DaysBefore != '' ||
      reminder.reminder2DaysBefore != null
    ) {
      // this.reminderSubList = { };
      let reminder2Obj = {
        id: reminder.id,
        type: 'reminder2',
        toUserTypeID: reminder.toUserTypeID,
        ccUserTypeID: reminder.ccUserTypeID,
        reminderTypeID: reminder.reminderTypeID,
        reminderType: reminder.reminderType,
        ccUserType: reminder.ccUserType,
        toUserType: reminder.toUserType,
        reminderSubject: reminder.reminderSubject2,
        reminderBody: reminder.reminderBody2,
        reminderDays: reminder.reminder2DaysBefore,
      };

      this.reminderSubList.push(reminder2Obj);

      if (
        reminder.reminderSubject3 != '' ||
        reminder.reminderSubject3 != null ||
        reminder.reminderBody3 != '' ||
        reminder.reminderBody3 != null ||
        reminder.reminder3DaysBefore != '' ||
        reminder.reminder3DaysBefore != null
      ) {
        let reminder3Obj = {
          id: reminder.id,
          type: 'reminder3',
          toUserTypeID: reminder.toUserTypeID,
          ccUserTypeID: reminder.ccUserTypeID,
          reminderTypeID: reminder.reminderTypeID,
          reminderType: reminder.reminderType,
          ccUserType: reminder.ccUserType,
          toUserType: reminder.toUserType,
          reminderSubject: reminder.reminderSubject3,
          reminderBody: reminder.reminderBody3,
          reminderDays: reminder.reminder3DaysBefore,
        };

        this.reminderSubList.push(reminder3Obj);
        this.skeletonShow = '';

      }
    }
  }

  getAllUserRole() {
    this.userroleService.getAllUserRoles().subscribe((data: any) => {
      if (data.message == 'OK') {
        this.UserRoleList = data.result.filter(
          (item: any) => item.isActive == true
        );

        if (this.UserroleID == 3) {
          this.ToUserRoleList = data.result.filter(
            (userRole: any) =>
              userRole.isActive && userRole.id != 1 && userRole.id != 2
          );
        } else {
          this.ToUserRoleList = data.result.filter(
            (userRole: any) =>
              userRole.isActive && userRole.id != 1 && userRole.id != 2
          );
        }
      }
    });
  }

  async getReminderType() {
    let data = await this.reminderService
      .getReminderType(this.UserroleID)
      .toPromise();
    if (data.message == 'Success') {
      this.ReminderTypeList = data.result ?? [];
    }
  }

  selectedToUser(e: any) {

    this.selectedToId = e;
  }

  selectedCC(e: any) {
    this.selectedToCC = e;
  }

  selectedReminder(e: any) {

    this.selectedReminderID = e;
  }
}
