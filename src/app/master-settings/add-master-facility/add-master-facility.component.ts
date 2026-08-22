import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddMasterFacilityService } from './add-master-facility.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';
import { NgxSpinnerComponent, NgxSpinnerService } from 'ngx-spinner';
import { CookieService } from 'ngx-cookie-service';
import { SkeletonLoaderComponent } from "../../common-component/skeleton-loader/skeleton-loader.component";

declare var $: any;

@Component({
  selector: 'app-add-master-facility',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, ToastrModule, CommonModule, NgxPaginationModule, BreadcrumbComponent, SkeletonLoaderComponent],
  templateUrl: './add-master-facility.component.html',
  styleUrl: './add-master-facility.component.css'
})
export class AddMasterFacilityComponent {
  faciltityForm: any;
  contentSize: number = 5;
  ContentP: number = 1;
  FacilitiesList: any;
  facilityValue: any;
  isEditMode: boolean = false;
  loginUserID: number = 0;
  skeletonShow = 'Skelton';
  constructor(private fb: FormBuilder, private facilityService: AddMasterFacilityService,
    private toastr: ToastrService, private spinner: NgxSpinnerService, private cookie: CookieService
  ) {
    this.faciltityForm = fb.group({
      facilityID: [0],
      facilityName: ['', Validators.required],
      isActive: true,
      loginUserID: [0]
    })
  }


  ngOnInit() {
    this.GetFacilityList();
    const userID = parseInt(this.cookie.get('UserId'));
    if (userID) {
      this.loginUserID = userID;
    }
  }

  onSubmit() {
    this.spinner.show();
    if (this.faciltityForm.valid) {
      this.faciltityForm.patchValue({
        loginUserID: this.loginUserID,
        facilityID: this.faciltityForm.value.facilityID == null ? 0 : this.faciltityForm.value.facilityID,
      })
      this.facilityService.ManageFacility(this.faciltityForm.value).subscribe(data => {
        if (data.message == "Success") {

          if (this.faciltityForm.get("facilityID").value > 0) {
            this.spinner.hide();
            this.toastr.success("Data updated successfully")
          }
          else {
            this.spinner.hide();
            this.toastr.success("Data saved successfully")
          }
        }
        else if (data.message == "Facility name already exists") {
          this.spinner.hide();
          this.toastr.warning("Facility name already exist")
        }
        this.reset();
        this.GetFacilityList();
        $("#exampleModal").modal('hide');
        this.isEditMode = false;

      })
    }
    else {
      this.faciltityForm.markAllAsTouched();
    }
  }

  GetFacilityList() {
    this.skeletonShow = 'Skelton';

    this.facilityService.GetAllFacilities().subscribe(data => {
      if (data.message == "Success") {
        this.FacilitiesList = data.result;
        this.skeletonShow = '';


      }
    })
  }


  onEdit(facilityID: any) {
    this.spinner.show();
    this.facilityService.GetFacilityById(facilityID).subscribe(data => {
      this.isEditMode = true;
      if (data.message == "Success") {
        this.facilityValue = data.result
        this.faciltityForm.patchValue({
          facilityID: this.facilityValue.facilityID,
          facilityName: this.facilityValue.facilityName,
          isActive: this.facilityValue.isActive,
        })
        this.spinner.hide();
      } else {
        this.toastr.error('Error patching facility')
        this.spinner.hide();
      }
    })

  }



  activeInactive(facilityID: any, isActive: any) {
    var action = "activated";
    Swal.fire({
      title: "Confirmation",
      text: isActive ? "Are you sure you want to deactivate the facility?" : "Are you sure you want to activate the facility?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: '#297084',
      cancelButtonColor: '#686767',
      confirmButtonText: isActive ? "Confirm" : "Confirm"
    }).then(result => {
      if (result.isConfirmed) {
        if (isActive == true) {
          action = "deactivated"
        }
        this.facilityService.ActiveInactiveFacilityId(facilityID).subscribe(data => {
          if (data.message == "Success") {
            this.toastr.success("Facility has been " + action + " successfully")
          }
          this.GetFacilityList();
        })
      }
      else {
        function check() {
          $("#check" + facilityID).prop("checked", true)
        }
        function uncheck() {
          $("#check" + facilityID).prop("checked", false)
        }
        isActive ? check() : uncheck()
      }

    })
  }


  get input() {
    return this.faciltityForm.controls
  }

  reset() {
    this.faciltityForm.reset({
      facilityID: 0,
      facilityName: '',

    })
  }

  cancel() {
    this.reset();
  }

  openAddFacilityModal() {
    this.isEditMode = false;
    this.faciltityForm.reset({
      facilityID: 0,
      facilityName: '',
      isActive: true,
    });
    $('#exampleModal').modal('show');
  }

}
