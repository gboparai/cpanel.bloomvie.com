import { Component } from '@angular/core';
import { BreadcrumbComponent } from '../common-component/breadcrumb/breadcrumb.component';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { SuuplyService } from './suuply.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { SkeletonLoaderComponent } from "../common-component/skeleton-loader/skeleton-loader.component";


@Component({
  selector: 'app-supply-request',
  standalone: true,
  imports: [BreadcrumbComponent, ReactiveFormsModule, CommonModule, FormsModule, NgxPaginationModule, NgFor, NgIf, NgxSpinnerModule, SkeletonLoaderComponent],
  templateUrl: './supply-request.component.html',
  styleUrl: './supply-request.component.css'
})
export class SupplyRequestComponent {
  isEditMode: any;
  SupplyForm: any;
  loginUserId: any;
  SupplyList: any[] = [];
  UserId: any;
  public ContentP: number = 1;
  public Contentsize: number = 5;
  SupplyValue: any;
  showReferralInput = false;
  centreID:any;
  supplyID:any;
  activeRoute:string='';
  skeletonShow="Skelton";
  expandedDescriptionIndex: number | null = null;





  constructor(private fbs: FormBuilder,
    private spinner: NgxSpinnerService,
    private supplyService: SuuplyService, private toaster: ToastrService, private cookies: CookieService, private supplyServie: SuuplyService) {
      this.SupplyForm = this.fbs.group({
        id: [0],
        itemName: ['', [Validators.required]],
        quantity: [null, [Validators.min(0)]],


          itemDescription: [
        '',
        [
        

          Validators.maxLength(500),

        ],
      ],
        createdBy: [0],
        statusID: [3],
        centreID:[0],
        referralLinks: this.fbs.array([this.createReferralLink()])
      });

  }

  ngOnInit() {
    this.UserId = this.cookies.get('UserId');
    this.loginUserId = this.cookies.get('UserId')
    this.centreID = this.cookies.get('CentreID')
    if (this.UserId > 0) {
      this.getSupplyList();
    }
  }



  // addReferralLink() {
  //   this.referralLinks.push('');

  // }

  get referralLinks(): FormArray {
    return this.SupplyForm.get('referralLinks') as FormArray;
  }

  

  createReferralLink(): FormControl {
  
    // return this.fbs.control('', Validators.required);
    return this.fbs.control('');

  }
  removeReferralLink(index: number): void {
   
    this.referralLinks.removeAt(index);
  }

  addReferralLink(): void {

    this.referralLinks.push(this.createReferralLink());
  }

  getReferralValues(): string[] {
   
    return this.referralLinks.value;
  }

  get itemName() {
    return this.SupplyForm.get('itemName');
  }


  // for pagination
  onPageChange(page: number): void {
    this.ContentP = page;
  }

  // OnEdit(id: any) {
  //   this.spinner.show();
  //   if (id > 0) {
  //     this.supplyService.getSupplyRequestById(id).subscribe((data: any) => {
  //       if (data.message == "OK") {
  //         this.SupplyValue = data.result[0]
  //         this.SupplyForm.patchValue({
  //           id: this.SupplyValue.id,
  //           itemName: this.SupplyValue.itemName,
  //           quantity: this.SupplyValue.quantity,
  //           itemDescription: this.SupplyValue.itemDescription,
  //           referralLink:this.SupplyValue.referralLinks
  //         });
  //         this.spinner.hide();
  //       }
  //     })
  //   }
  // }

  OnEdit(id: any) {
    this.supplyID = id
 
    this.spinner.show();
    if (id > 0) {
      this.supplyService.getSupplyRequestById(id).subscribe((data: any) => {
        if (data.message === "OK") {
          // this.SupplyValue = data.result[0];
          this.SupplyValue = data.result;
  
          // Patch the simple fields
          this.SupplyForm.patchValue({
            id: this.SupplyValue.id,
            itemName: this.SupplyValue.itemName,
            quantity: this.SupplyValue.quantity,
            itemDescription: this.SupplyValue.itemDescription,
            centreID: this.centreID
          });
  
          this.referralLinks.clear();

       
          const referralLinksArray = this.SupplyValue.referralLinks
          ? this.SupplyValue.referralLinks.split(',').map((link: string) => link.trim())
          : [];

        
        referralLinksArray.forEach((link: string) => {
          this.referralLinks.push(this.fbs.control(link, Validators.required));
        });


        this.showReferralInput = true;
        // this.removeReferralLink(0)

  
          // if (this.SupplyValue.referralLinks && this.SupplyValue.referralLinks.length > 0) {
          //   this.SupplyValue.referralLinks.forEach((link: string) => {
          //     this.referralLinks.push(this.fbs.control(link, Validators.required));
          //   });
          // } else {
          //   // If empty, add at least one input
          //   this.referralLinks.push(this.createReferralLink());
          // }
  
          this.spinner.hide();
        }
        else{
          this.spinner.hide();
        }
      });
    }
  }
  


  onDelete(id: number) {
   
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this supply?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        // Second Swal to get reason
        Swal.fire({
          title: 'Reason for Deletion',
          input: 'textarea',
          inputLabel: 'Please enter a reason',
          inputPlaceholder: 'Type your reason here...',
          inputAttributes: {
            'aria-label': 'Reason'
          },
          showCancelButton: true,
          confirmButtonText: 'Submit'
        }).then((inputResult) => {
          if (inputResult.isConfirmed && inputResult.value?.trim()) {
            const reason = inputResult.value.trim();

            // Now call the delete API with ID and reason
            this.supplyService.DeleteSupply(id, reason).subscribe({
              next: (res: any) => {
                Swal.fire('Deleted!', res.message || 'Supply deleted successfully.', 'success');
                this.getSupplyList();
              },
              error: (err) => {
                Swal.fire('Error!', err?.error?.message || 'An error occurred.', 'error');
                console.error(err);
              }
            });

          } else if (!inputResult.isConfirmed || !inputResult.value?.trim()) {
            Swal.fire('Cancelled', 'Deletion reason is required.', 'info');
          }
        });
      }
    });
  }




  OnSubmitSupply() {  
    this.spinner.show();   
    if (this.SupplyForm.valid) {
      const isEdit = this.SupplyForm.value.id && this.SupplyForm.value.id !== 0;

      this.SupplyForm.patchValue({
        createdBy: this.loginUserId > 0 ? this.loginUserId : 0,
        quantity: this.SupplyForm.value.quantity || 0,
        centreID: this.centreID

      });

      this.supplyService.manageSuuplyRequest(this.SupplyForm.value).subscribe({
        next: (data: any) => {
          this.spinner.hide();

          if (data.message === "Supply Updated Successfully") {
            // this.SupplyForm.value.re = [''];
            this.referralLinks.clear(); 
            this.addReferralLink();  
            this.supplyID = ''

            this.showReferralInput = false;
            this.toaster.success("Supply Updated Successfully");
          } else if (data.message === "Supply Added Successfully") {
            this.referralLinks.clear(); 
            this.addReferralLink();  
            this.showReferralInput = false;
            this.toaster.success("Supply Added Successfully");
          } else {
            this.toaster.warning("Unexpected response");
          }

          this.getSupplyList();
          this.resetForm();
        },
        error: (err) => {
          this.spinner.hide();
          this.toaster.error("An error occurred while processing the request");
          console.error(err);
        }
      });
    } else {
      this.spinner.hide();
      this.SupplyForm.markAllAsTouched();
    }
  }



  cancel() {
    this.isEditMode = false;
    this.resetForm();
    window.location.reload();
  }
  resetForm() {
    this.SupplyForm.reset();
    this.SupplyForm.patchValue({
      id:0,
      statusID: 3,
    });
  }


  getSupplyList() {
  this.skeletonShow="Skelton";
    this.supplyServie.getSupplyRequestByLoginId(this.UserId).subscribe((data: any) => {
      if (data.message == "OK") {
        this.SupplyList = data.result;
  this.skeletonShow="";
      }
      else{
  this.skeletonShow="";
      }
    }, (error) => {
      console.error("Error fetching supply request:", error);
  this.skeletonShow="";
    });
  }

  onView(id: number) {  
    if (id != null) {
      const selectedRequest = this.SupplyList.find(x => x.id == id);      
      if (selectedRequest) {        
        Swal.fire({
          title: 'Reason for Deletion',
          text: selectedRequest.reason || 'No reason provided',
          icon: 'info',
          confirmButtonText: 'OK'
        });
      }
    }
  }


}
