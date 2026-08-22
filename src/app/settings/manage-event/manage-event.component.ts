
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';
import { UserRoleService } from '../Permission/user-role/user-role.service';
import { CommonService } from '../../common-component/common.service';
import { CookieService } from 'ngx-cookie-service';
import { ManageEventService } from './manage-event.service';
declare let $: any;

@Component({
  selector: 'app-manage-event',
  standalone: true,
  imports: [RouterLink,
    FormsModule,
    BreadcrumbComponent,
    ReactiveFormsModule,
    CommonModule,
    NgxPaginationModule],
  templateUrl: './manage-event.component.html',
  styleUrl: './manage-event.component.css'
})
export class ManageEventComponent {

  checkBoxState: { [id: number]: { bloomvie: boolean, daycare: boolean } } = {};
  form: any;
  userRoleList: any;
  isEditMode: boolean = false;
  ContentP: number = 1;
  Contentsize: number = 5
  feature: any;
  MasterAllEvents:any;
 centreID:any;
 userID:any;
userRoleID:any;

public searchText: string = '';
  filteredEvent: any;


  
  constructor(private service: ManageEventService, private userroleService: UserRoleService, private fb: FormBuilder, private toastr: ToastrService, private spinner: NgxSpinnerService
  , private cookie:CookieService) {
    this.form = this.fb.group({
      id: 0,
      name:['', Validators.required],
      userRoleID: [0, Validators.required],
      centreID: [0],
      userID: [0],
      isActive: true,
    })
  }

  ngOnInit() {
    this.centreID = this.cookie.get('CentreID');
    this.userID = parseInt(this.cookie.get('UserId'));
   this.userRoleID = parseInt(this.cookie.get('UserRoleId'));

    this.getMasterEvent();
   

  }



  manageMasterEvent() {
    if (this.form.valid) {
      this.spinner.show();



      this.form.patchValue({
        id: this.form.value.id == null ? 0 : this.form.value.id,
        userID:this.userID,
        centreID: this.centreID,
        userRoleID: this.userRoleID,
        isActive: true,
      })

      
      this.service.manageMasterEvent(this.form.value).subscribe(data => {
        if (data.message === 'OK') {

          this.toastr.success("Events has been added successfully");
          this.spinner.hide();
          this.getMasterEvent();
          this.form.reset();
          this.isEditMode = false;
        }  else if(data.message == 'Updated successfully') {

          this.toastr.success("Events has been  updated successfully");
          this.spinner.hide();
          this.getMasterEvent();
          this.form.reset();
          this.isEditMode = false;
        }
        else {

          this.toastr.error('', data.Message);
        }

        this.form.reset();
      });
      setTimeout(() => {
      }, 1000);
    }
    else {
      this.form.markAllAsTouched();
    }
  }
  


  applyFilter() {
    const term = this.searchText.trim().toLowerCase();
  
    this.filteredEvent = this.MasterAllEvents.filter((item: any) =>
      item.name?.toLowerCase().includes(term)
    );
  
    this.ContentP = 1;
  }
  
  get displayedEvent() {
    return this.searchText?.trim() ?  this.filteredEvent : this.MasterAllEvents;
  }

  getMasterEvent(): void {
    const type =  this.userRoleID == 3 ? 'Day Care Admin' : 'Bloomvie Owner';

    this.service.getMasterEvent(this.userID, this.userRoleID, type).subscribe({
      next: (data) => {
        if (data.message === 'OK') {
          this.MasterAllEvents = data.result;
        } else {
          console.error('Error:', data.message);
        }
      },
      error: (err) => {
        console.error('HTTP Error:', err);
      }
    });
  }
  

  onEdit(item: any) {
    this.isEditMode = true;
    this.form.patchValue({
      id: item.id,
      centreID:item.centreID,
      userRoleID:item.userRoleID,
      name: item.name,
      isActive: item.isActive
    })

  }


  Reset() {
    this.form.reset({
      id: 0,
      name: '',

    })
  }

  cancel() {
    this.isEditMode = false;
    this.Reset();
  }




  ActiveInactiveEvent(id: number, isActive: boolean): void {
    let action = 'activated';
  
    Swal.fire({
      title: isActive 
        ? "Are you sure you want to deactivate this qualification?" 
        : "Are you sure you want to activate this qualification?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#297084',
      cancelButtonColor: '#686767',
      confirmButtonText: "Confirm"
    }).then((result) => {
  
      if (result.isConfirmed) {
        if (isActive === true) {
          action = 'deactivated';
        }
  
        this.service.activeInActiveEventID(id).subscribe(res => {
          this.getMasterEvent();
          this.toastr.success(`Event has been ${action} successfully.`);
        });
  
      } 
    });
  }
  


  get input() {
    return this.form.controls;
  }





}


