import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormsModule,
  FormControl,
  FormArray,
} from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SuuplyService } from '../supply-request/suuply.service';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';
import { Router } from '@angular/router';
import { error } from 'node:console';
import { CommonService } from '../common-component/common.service';
import { ElementRef, ViewChild } from '@angular/core';
import { SkeletonLoaderComponent } from '../common-component/skeleton-loader/skeleton-loader.component';
import { BreadcrumbComponent } from '../common-component/breadcrumb/breadcrumb.component';
import { TooltipComponent } from '../common-component/tooltip/tooltip.component';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
declare var $: any;

@Component({
  selector: 'app-view-supply-request',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    NgFor,
    NgIf,
    NgxPaginationModule,
    DatePipe,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    NgSelectModule,
    SkeletonLoaderComponent,
    TooltipComponent,
    ImageCropperComponent
  ],
  providers: [DatePipe],
  templateUrl: './view-supply-request.component.html',
  styleUrl: './view-supply-request.component.css',
})
export class ViewSupplyRequestComponent {
  @ViewChild('receiptPhoto') fileInput!: ElementRef<HTMLInputElement>;
  // SupplyList:any;
  UserId: any;
  selectedItemId: any;
  selectedStatusId: any;
  HideActionButton: boolean = false;
  public SupplyList: any[] = [];
  public filteredSupplyList: any[] = [];
  public searchText: string = '';
  public Contentsize = 5;
  public ContentP = 1;
  paginatedSupplies: any[] = [];
  allItemsList: any[] = [];
  activeRoute: string = '';
  SupplyForm: any;
  centreID: number = 0;
  purchasedForm: any;
  expenseType: any[] = [];
  file: any;
  skeletonShow = 'Skelton';
  hoveredRow: any = null;
    expandedDescriptionIndex: number | null = null;

  imageChangedEvent: any;
  imageFileBlob: Blob[] = [];
  imageTypeFileForCrop: string = '';
  showUploadBtnToUploadCroppedImages: boolean = false;
  tempCroppedEvent: any;
  singleImageUploadedFirst: boolean = false;
  currentFileIndex: number = 0;
  imageFiles: File[] = [];
  public fileNamesDisplay: string = '';
  imagePreviews: any[] = [];
  formsData = new FormData();
  fileList: any[] = [];
  fileName:any;
  isSubmitDisabled:boolean=true;

  constructor(
    private supplyServie: SuuplyService,
    private cookies: CookieService,
    private toaster: ToastrService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private fbs: FormBuilder,
    private commonService: CommonService
  ) {
    this.SupplyForm = this.fbs.group({
      id: [0],
      itemName: ['', [Validators.required]],
      quantity: [null, [Validators.min(0)]],
      itemDescription: [''],
      createdBy: [0],
      statusID: [3],
      centreID: [0],
      // referralLinks: ['']
    });

    this.purchasedForm = this.fbs.group({
      id: [0],
      expenseType: [, [Validators.required]],
      cost: [, [Validators.required]],
      quantity: [, Validators.required],
      ReceiptImagePath: [],
      ReceiptImage: [],
      createdBy: [0],
      itemId: [0],
      paymentType: [''],
    });
  }

  ngOnInit() {
    this.UserId = this.cookies.get('UserId');
    this.centreID = parseInt(this.cookies.get('CentreID'));
    if (this.UserId > 0) {
      this.getSupplyList('pending');
    }
    this.activeRoute = this.router.url;
    this.getAllExpenseTypes();
  }
  // getSupplyList(status:string) {
  //   this.spinner.show();
  //   this.SupplyList=[];
  //   if(status == 'accepted')
  //   {
  //     this.HideActionButton = true;
  //   }else{
  //     this.HideActionButton = false;
  //   }
  //   this.supplyServie.getSuuplyRequest(this.UserId,status).subscribe((data: any) => {
  //     if (data.message == "OK") {
  //       this.SupplyList = data.result;
  //       this.spinner.hide();
  //     }
  //   }, (error) => {
  //     console.error("Error fetching supply request:", error);
  //     this.spinner.hide();

  //   });
  // }

  ////not in use yet
  get referralLinks(): FormArray {
    return this.SupplyForm.get('referralLinks') as FormArray;
  }
  createReferralLink(): FormControl {
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
  ///////

  async getSupplyList(status: string): Promise<void> {
    this.skeletonShow = 'Skelton';
    this.SupplyList = [];
    this.filteredSupplyList = [];
    this.paginatedSupplies = [];
    this.ContentP = 1;

    this.HideActionButton = status === 'accepted';
    try {
      const data: any = await this.supplyServie
        .getSuuplyRequest(this.UserId, status)
        .toPromise();
      if (data.message === 'Success') {
        this.SupplyList = data.result;
        this.filteredSupplyList = [...this.SupplyList];
        // this.paginateData(); // Uncomment if needed
        this.skeletonShow = '';
      }
    } catch (error) {
      console.error('Error fetching supply request:', error);
    } finally {
      this.skeletonShow = '';
    }
  }

  // paginateData() {
  //   const allItems: any[] = [];

  //   this.filteredSupplyList.forEach((supply) => {
  //     supply.items.forEach((item: any) => {
  //       allItems.push({
  //         ...item,
  //         teacherName: supply.teacherName,
  //         appliedOn: supply.appliedOn,
  //       });
  //     });
  //   });

  //   this.allItemsList = allItems;

  //   const start = (this.ContentP - 1) * this.Contentsize;
  //   const end = start + this.Contentsize;
  //   this.paginatedSupplies = allItems.slice(start, end);
  // }

  // onPageChange(page: number) {
  //   this.ContentP = page;
  //   this.paginateData();
  // }

  // applyFilter() {
  //   const term = this.searchText.trim().toLowerCase();

  //   this.filteredSupplyList = this.SupplyList.map((supply: any) => {
  //     const isTeacherMatch = supply.teacherName?.toLowerCase().includes(term);

  //     const matchedItems = supply.items?.filter((item: any) =>
  //       item.itemName?.toLowerCase().includes(term)
  //     );

  //     if (isTeacherMatch) {
  //       return { ...supply };
  //     } else if (matchedItems && matchedItems.length > 0) {
  //       return {
  //         ...supply,
  //         items: matchedItems
  //       };
  //     }

  //     return null;
  //   }).filter(Boolean);
  // }

  applyFilter() {
    const term = this.searchText.trim().toLowerCase();

    this.filteredSupplyList = this.SupplyList.map((supply: any) => {
      const isTeacherMatch = supply.teacherName?.toLowerCase().includes(term);

      const matchedItems = supply.items?.filter((item: any) =>
        item.itemName?.toLowerCase().includes(term)
      );

      if (isTeacherMatch) {
        return { ...supply }; // include all items
      } else if (matchedItems && matchedItems.length > 0) {
        return {
          ...supply,
          items: matchedItems,
        };
      }

      return null;
    }).filter(Boolean);

    this.ContentP = 1;
    // this.paginateData();
  }

  get displayedSupplyList() {
    return this.searchText?.trim() ? this.filteredSupplyList : this.SupplyList;
  }

  openApproveModal(item: any) {
    this.selectedItemId = item.id;
    $('#modalOpen').modal('show');
  }

  approveSupply(statusid: any, itemId: any) {
    this.spinner.show();
    this.supplyServie
      .approveOrRejectSupplyRequest(statusid, itemId, this.UserId)
      .subscribe((data: any) => {
        if (data.message == 'Item not found') {
          this.toaster.warning('Item not found');
        } else if (data.message == 'Item Approved') {
          this.toaster.success('Item Approved');
          $('#modalOpen').modal('hide');
        } else if (data.message == 'Item Rejected') {
          this.toaster.error('Item has been rejected');
          $('#modalOpen').modal('hide');
        }
        this.getSupplyList('pending');
      });
  }

  onAccept(item: any) {
    this.purchasedForm.reset();
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
    
    this.selectedItemId = item.id;
    if (item.userRoleID == 4) {
      Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to accept this supply item?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, accept it!',
        cancelButtonText: 'No, cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          $('#purchased').modal('show');
        }
      });
    } else {
      $('#purchased').modal('show');
    }
  }

  onReject(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to reject this supply item?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, reject it!',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.approveSupply(2, id); // statusId 2 = Rejected
      }
    });
  }

  resetSupplyForm() {
    this.SupplyForm.reset({
      id: 0,
      itemName: '',
      quantity: null,
      itemDescription: '',
      createdBy: 0,
      statusID: 3,
      centreID: 0
    });
  }

  onSubmit() {
    if (this.SupplyForm.valid) {
      this.spinner.show();
      this.SupplyForm.patchValue({
        createdBy: this.UserId > 0 ? this.UserId : 0,
        quantity: this.SupplyForm.value.quantity || 0,
        centreID: this.centreID,
      });
      this.supplyServie.manageSuuplyRequest(this.SupplyForm.value).subscribe({
        next: (data: any) => {
          if (data.message === 'Supply Updated Successfully') {
            this.toaster.success('Supply Updated Successfully');
            this.resetSupplyForm();
            $('#addItemModal').modal('hide');
            this.getSupplyList('pending');
            this.spinner.hide();
          } else if (data.message === 'Supply Added Successfully') {
            this.toaster.success('Supply Added Successfully');
            this.resetSupplyForm();
            $('#addItemModal').modal('hide');
            this.getSupplyList('pending');
            this.spinner.hide();
          } else {
            this.toaster.warning('Unexpected response');
            this.spinner.hide();
          }
        },
        error: (err) => {
          this.spinner.hide();
          this.toaster.error('An error occurred while processing the request');
          console.error(err);
        },
      });
    } else {
      this.spinner.hide();
      this.SupplyForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.resetSupplyForm();
    this.purchasedForm.reset();
    this.fileInput.nativeElement.value = '';
  }

  getAllExpenseTypes() {
    this.supplyServie.getAllExpenseTypes().subscribe({
      next: (data: any) => {
        if (data.message == 'Success') {
          this.expenseType = data.result;
        } else {
          
        }
      },
      error: (err) => {
        this.toaster.error('An error occurred while processing the request');
        console.error(err);
      },
    });
  }

  purchaseItemSubmit() {
    this.spinner.show();
    if (this.purchasedForm.valid) {
      this.purchasedForm.patchValue({
        createdBy: this.UserId > 0 ? this.UserId : 0,
        itemId: this.selectedItemId,
      });
      this.supplyServie
        .reviewSupplyRequest(this.purchasedForm.value)
        .subscribe({
          next: (data: any) => {
            if (data.message === 'Success') {
              this.toaster.success('Item approved successfully.');
              this.purchasedForm.reset();
              this.fileInput.nativeElement.value = '';
              this.getSupplyList('pending');
              this.spinner.hide();
              $('#purchased').modal('hide');
            } else {
              this.spinner.hide();
              this.toaster.error(data.message || 'Unexpected error occurred.');
            }
          },
          error: (err) => {
            this.spinner.hide();
            this.toaster.error(
              'An error occurred while processing the request'
            );
            console.error(err);
          },
        });
    } else {
      this.spinner.hide();
      this.purchasedForm.markAllAsTouched();
      this.toaster.error('Please fill in all required fields.');
    }
  }

  // async imageInput(image: any) {
  //   const target: any = image.target as HTMLInputElement;
  //   const selectedFiles = target.files;

  //   if (!selectedFiles) {
  //     console.error('No file selected');
  //     return;
  //   }
  //   const formdata = new FormData();
  //   formdata.append('files', selectedFiles[0], selectedFiles[0].name);
  //   formdata.append('type', 'CapitolExpenses');
  //   this.UploadFiles(formdata);
  // }

  async UploadFiles(data: any): Promise<any> {
    try {
      const response = await this.commonService.uploadImages(data).toPromise();
      this.purchasedForm.patchValue({
        ReceiptImage: response.result[0].imageName,
        ReceiptImagePath: response.result[0].path,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  //selected File before cropping
  FileSelectionBeforeCrop(event: any) {

    this.fileName = event.target.files[0].name
    this.imageChangedEvent = event; 
    $("#cropperModal").modal('show');
  }

  //storing cropped file temporarily
  storeTempCrop(event: ImageCroppedEvent) {
   
    this.tempCroppedEvent = event.blob;      
  } 

  ///uploading the cropped file to AWS
  async fileChangeHandler(type: string) {

    const file=this.commonService.blobToFile(this.tempCroppedEvent,this.fileName)
    if (!file) return;
    this.fileNamesDisplay = file.name;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreviews = [e.target.result];      
    };
    reader.readAsDataURL(file);
    this.fileList = [];
    this.formsData = new FormData();
    this.fileList.push({ file, type });
    this.formsData.append('files', file);
    this.formsData.append('type', type); 
    const response = await this.UploadFiles(this.formsData);  
    if(response.message=="OK"){
      this.isSubmitDisabled = false;
    }
    $("#cropperModal").modal('hide');

  }

 resetImage(){
    $('#receiptPhoto').val(''); 
  }
}
