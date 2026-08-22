
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
import { SkeletonLoaderComponent } from "../../common-component/skeleton-loader/skeleton-loader.component";
declare let $: any;

@Component({
  selector: 'app-manage-qualification',
  standalone: true,
  imports: [RouterLink,
    FormsModule,
    BreadcrumbComponent,
    ReactiveFormsModule,
    CommonModule,
    NgxPaginationModule, SkeletonLoaderComponent],
  templateUrl: './manage-qualification.component.html',
  styleUrl: './manage-qualification.component.css'
})



// interface userRoleAndRelationDataObj {
//   RoleId: number;
//   RoleBelongsTo: string;
//   Activate: boolean;
// }

export class ManageQualificationComponent {

  checkBoxState: { [id: number]: { bloomvie: boolean, daycare: boolean } } = {};
  form: any;
  userRoleList: any;
  isEditMode: boolean = false;
  ContentP: number = 1;
  Contentsize: number = 5
  feature: any;
  MasterAllQualifications: any[] = [];
  centreID: any;
  userID: any;
  userRoleID: any;
  filteredQualifications: any[] = [];
  public searchText: string = '';
  skeletonShow = 'Skelton';




  constructor(private service: CommonService, private userroleService: UserRoleService, private fb: FormBuilder, private toastr: ToastrService, private spinner: NgxSpinnerService
    , private cookie: CookieService) {
    this.form = this.fb.group({
      id: 0,
      name: ['', Validators.required],
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

    this.getMasterAllQualifications();
    // this.getCheckboxState();


  }

  // getCheckboxState() {

  //   if (this.userRoleList.length > 0) {
  //     this.userRoleList.forEach((state: any) => {
  //       if (!this.checkBoxState[state.id]) {
  //         this.checkBoxState[state.id] = {
  //           bloomvie: state.bloomvie,
  //           daycare: state.daycare
  //         }
  //       }
  //     });
  //   }
  // }

  applyFilter() {
    const term = this.searchText.trim().toLowerCase();

    this.filteredQualifications = this.MasterAllQualifications.filter((item: any) =>
      item.name?.toLowerCase().includes(term)
    );

    this.ContentP = 1;
  }

  get displayedQualifications() {
    return this.searchText?.trim() ? this.filteredQualifications : this.MasterAllQualifications;
  }

  manageMasterQualifications() {
    if (this.form.valid) {
      this.spinner.show();
      this.form.patchValue({
        id: this.form.value.id == null ? 0 : this.form.value.id,
        userID: this.userID,
        centreID: this.centreID,
        userRoleID: this.userRoleID,
        isActive: true,
      })


      this.service.manageMasterQualifications(this.form.value).subscribe(data => {
        if (data.message === 'OK') {

          this.toastr.success("Qualifications has been added successfully");
          this.spinner.hide();
          this.getMasterAllQualifications();
          // this.form.reset();
            this.form.patchValue({
            id: this.form.value.id == null ? 0 : this.form.value.id,
            userID: this.userID,
            centreID: this.centreID,
            userRoleID: this.userRoleID,
            isActive: true,
          })

          this.isEditMode = false;
        } else if (data.message == 'Updated successfully') {

          this.toastr.success("Qualifications has been  updated successfully");
          this.spinner.hide();
          this.getMasterAllQualifications();
          // this.form.reset();
                this.form.patchValue({
            id: this.form.value.id == null ? 0 : this.form.value.id,
            userID: this.userID,
            centreID: this.centreID,
            userRoleID: this.userRoleID,
            isActive: true,
          })
          this.isEditMode = false;
        }
        else {

          this.toastr.error('', data.Message);
        }

        // this.form.reset();
              this.form.patchValue({
            id: this.form.value.id == null ? 0 : this.form.value.id,
            userID: this.userID,
            centreID: this.centreID,
            userRoleID: this.userRoleID,
            isActive: true,
          })
      });
      setTimeout(() => {
      }, 1000);
    }
    else {
      this.form.markAllAsTouched();
    }
  }

  getMasterAllQualifications(): void {

                      this.skeletonShow = 'Skelton';

    const type = this.userRoleID == 3 ? 'Day Care Admin' : 'Bloomvie Owner';

    this.service.getMasterAllQualifications(this.userID, this.userRoleID, type).subscribe({
      next: (data) => {
        if (data.message === 'OK') {
          this.MasterAllQualifications = data.result;
                      this.skeletonShow = '';

        } else {
          console.error('Error:', data.message);
                      this.skeletonShow = '';

        }
      },
      error: (err) => {
        console.error('HTTP Error:', err);
                      this.skeletonShow = '';

      }
    });
  }


  onEdit(item: any) {
    this.isEditMode = true;
    this.form.patchValue({
      id: item.id,
      centreID: item.centreID,
      userRoleID: item.userRoleID,
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




  ActiveInactiveQualification(id: number, isActive: boolean): void {
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

        this.service.activeInActiveQualificationID(id).subscribe(res => {
          this.getMasterAllQualifications();
          this.toastr.success(`Qualification has been ${action} successfully.`);
        });

      }
    });
  }



  get input() {
    return this.form.controls;
  }



}


