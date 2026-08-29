import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { FlatpickrModule } from 'angularx-flatpickr';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '../../common-component/common.service';
import { ToastrService } from 'ngx-toastr';
import { ManageTeacherService } from './manage-teacher.service';
import Swal from 'sweetalert2';
import { ManageDaycareService } from '../../day-care-management/manage-daycare/manage-daycare.service';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../environments/environment';
declare var flatpickr:any;
declare var $:any;

@Component({
  selector: 'app-manage-teacher',
  standalone: true,
  imports: [NgSelectModule,FlatpickrModule,FormsModule,ReactiveFormsModule],
  templateUrl: './manage-teacher.component.html',
  styleUrl: './manage-teacher.component.css'
})
export class ManageTeacherComponent implements OnInit{
  teacherForm: any;
  public countryList:any[]=[];
  public stateList2:any[]=[];
  public cityList2:any[]=[];
  public Gender: Array<{ label: string, value: string }> = [
    { label: 'Male', value: 'M' },
    { label: 'Female', value: 'F' },
    { label: 'Other', value: 'O' }
  ];
  teacherData: any;
  bankingDetailsForm: any;
  public readFiles:{profile:any,document:any}={
    profile:'assets/img/image-selector-profile.jpg',
   
    document:'',
  };
  private files:{profile:any,document:any}={
    profile:null,
    document:null
  };
  public filesErrors:{profile:any,document:any}={
    profile:null,
    document:null
  };
  UserID: any;
  documentForm: any;
  public documentTypeList:any[]=[];
  private arrayIndex:any;
  public documentList:any[]=[];
  public baseURL:string=environment.apiUrl.slice(0,-3)
  CentreID: any;
constructor(private fb :FormBuilder,private spinner:NgxSpinnerService,private commonservice:CommonService,private toastr:ToastrService,
  private teacherService : ManageTeacherService,private managedaycareservice:ManageDaycareService,private cookie:CookieService
){
  this.teacherForm=fb.group({
    "id": [0],
    "centreID":[1],
    "userRoleID": [4],
    "firstName": [null,[Validators.required]],
    "email":[null,[Validators.required,Validators.email]],
    "mobile": [null,[Validators.required]],
    "gender": [null,[Validators.required]],
    "countryID":[null,[Validators.required]],
    "stateID": [null,[Validators.required]],
    "cityID": [null,[Validators.required]],
    "dob": [null,[Validators.required]],
    "pinCode": [null,[Validators.required]],
    "address": [null,[Validators.required]],
    "loginUserID" :[0],
    "filePath":[null],
    "fileName":[null],
});
this.bankingDetailsForm=fb.group({
  "id": [0],
  "accountHolderName":[null],
  "userRoleID"  :[4],
  "bankName": [null,[Validators.required]],
  "bankAddress": [null,[Validators.required]],
  "accountNumber":[null,[Validators.required]],
  "dayCareID": [0],
  "institutionNumber": [null,[Validators.required,Validators.pattern(/(?<!\d)\d{3}(?!\d)/g)]],
  "transitNumber": [null,[Validators.required,Validators.pattern(/(?<!\d)\d{5}(?!\d)/g)]],
  "postalCode": [null,[Validators.required]],
  "loginUserID": [0]
});


this.documentForm=fb.group(
  {
    "id": [0],
    "referenceTableID": [0],
    "referenceTableName":["MasterCentreRegistration"],
    "documentTypeID": [null,[Validators.required]],
    "documentNumber": [null,[Validators.required]],
    "documentImage": [null],
    "documentImagePath": [null],
    "documentDescription":[null],
    "loginUserID": [0],
    "isActive":true
  }
);

}


  ngOnInit(): void {
    this.UserID = parseInt(this.cookie.get('UserId'));
    this.CentreID = parseInt(this.cookie.get('DayCare_CenterID'));
    this.getCountryList();
    this.getDocumentTypeList();
  }

  ngAfterViewInit(): void {
    var date = new Date();
    var currentMonth = date.getMonth() + 1;
    var currentDate = date.getDate();
    var currentYear = date.getFullYear();
    flatpickr("input[type='date']", {
      dateFormat: 'Y-m-d',
    });
    $("#dob").flatpickr({
      maxDate: new Date(currentYear - 18, currentMonth, currentDate)
    });
  }

  allowOnlyNumericInput(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
        if (
      (charCode < 48 || charCode > 57) &&  
      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(event.key) 
    ) {
      event.preventDefault(); 
    }
  }


  onChangeCountry(countryID:number){
    
      this.teacherForm.get('cityID').reset();
      this.teacherForm.get('stateID').reset();
      this.cityList2=[];
      this.stateList2=[];
      this.getStateListByCountryID(countryID);
    

  }

  onChangeState(StateID:number){
   
      this.teacherForm.get('cityID').reset();
      this.cityList2=[];
      this.getCityListByStateID(StateID);
    
  }

  getCountryList(){
    this.spinner.show();
    this.commonservice.getCountryList().subscribe({
      next:(response)=>{
        if(response.message==='Success'){
          this.countryList=response.result;
        };
        setTimeout(() => {
          this.spinner.hide();
        },300);
      },
      error:(err)=>{
        this.spinner.hide();
      }
    })
  }
  getStateListByCountryID(countryID:number){
    this.spinner.show();
    this.commonservice.getStateListByCountryID(countryID).subscribe({
      next:(response)=>{
       if(response.message==='Success'){
          this.stateList2=response.result;
       };
       setTimeout(() => {
        this.spinner.hide();
       },300);
      },
      error:(err)=>{
        this.spinner.hide();
        this.toastr.error(err.message);
        
      }
    })
  }

  getCityListByStateID(stateID:number){
    this.spinner.show();
    this.commonservice.getCitiesListByStateID(stateID).subscribe({
      next:(response)=>{
       if(response.message==='Success'){
          this.cityList2=response.result;
        
       };
       setTimeout(() => {
        this.spinner.hide();
        
       },300);
      },
      error:(err)=>{
        this.spinner.hide();
        this.toastr.error(err.message)
      }
    })
  }

  UploadFiles(data: any): Promise<any> {
    this.spinner.show();
    return this.commonservice.uploadImages(data).toPromise()
      .then(response => response)
      .catch(error => {
        this.spinner.hide();
        throw error;
      });
  }



validateForms(): boolean {
  if (this.teacherForm.invalid || (!this.files.profile && this.teacherForm.get('id')?.value < 1)) {
    this.teacherForm.markAllAsTouched();
    if (!this.files.profile && this.teacherForm.get('id')?.value < 1) {
      this.filesErrors.profile = "This field is required.";
    }

    return false;
  }

  // If no errors, reset the profile file error message
  this.filesErrors.profile = null;

  return true;
}
  registerTeacher() {
    if (this.validateForms()) {
      this.spinner.show();
      
      let formData: FormData | null = null;
  
      // Manage Files
      if (this.files.profile) {
        formData = new FormData();
        formData.append('files', this.files.profile);
        formData.append('type', 'Profile_Image');
      }
  
      if (formData) {
        this.UploadFiles(formData).then(fileResponse => {
          if (fileResponse.message === "OK") {
            fileResponse.result.map((item: any) => {
              this.teacherForm.get('filePath')?.setValue(item.path);
              this.teacherForm.get('fileName')?.setValue(item.imageName);
            });
          }
          this.teacherForm.patchValue({
            "loginUserID":  this.UserID,
          });
          // Now, proceed with managing the teacher
          this.teacherService.manageTeacher(this.teacherForm.value).subscribe({
            next: (response) => {
              if (response.message === "Success") {
                this.toastr.success(response.activity);
                this.teacherData = response.result;
                const accountHolderName=this.teacherForm.get('firstName').value;
                this.bankingDetailsForm.get('accountHolderName').setValue(accountHolderName);
                setTimeout(() => {
                  document.getElementById('pills-document')?.click();
                  this.spinner.hide();
                }, 300);
              } else {
                this.spinner.hide();
                this.toastr.error(response.message);
              }
            },
            error: (err) => {
              this.spinner.hide();
              this.toastr.error(err.message || "An error occurred.");
            }
          });
        }).catch(error => {
          this.spinner.hide();
          this.toastr.error("An error occurred during file upload.");
        });
      }
    } else {
      this.teacherForm.markAllAsTouched();
    }
  }

  manageBankingInfo(){
    if(this.bankingDetailsForm.valid){
      this.spinner.show();
      this.bankingDetailsForm.patchValue({
        "dayCareID": this.teacherData,
        "loginUserID":  this.UserID,
      })
     
      this.managedaycareservice.manageBankingInfo(this.bankingDetailsForm.value).subscribe({
        next:(response)=>{
          if(response.message==='Success'){
            this.toastr.success(response.activity);
          };
          this.bankingDetailsForm.get('id').setValue(response.result);
          setTimeout(() => {
            this.spinner.hide();
            document.getElementById('pills-document1')?.click();
          },300);
        },
        error:(err)=>{
        this.toastr.error(err.message);
        this.spinner.hide();
        }
      })
    }else{
      this.bankingDetailsForm.markAllAsTouched();
    }
  }


  async onFileChange(IsCenter:boolean,event:any){
    const file=event.target.files[0];
    if(!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
        await Swal.fire({
            icon: 'error',
            title: 'Invalid File Type',
            text: 'Only JPEG, PNG, and GIF are allowed.',
        });
        return;
    }
    const fileContent=await this.readFileAsync(file);
    if(fileContent){
     
        this.readFiles.profile=fileContent;
        this.files.profile=file;
        this.filesErrors.profile=null;
      
    }

  }

  private readFileAsync(file: File): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
        const filereader = new FileReader();
        filereader.onload = (data:any) => {
            resolve(data.target?.result);
        };
        filereader.onerror = (error) => {
            reject(error);
        };
        filereader.readAsDataURL(file); 
    });
}


onTabChange(tab:string){
  if(tab==="Tab-3"){
   
  }else if(tab==="Tab-2"){
    const adminName=this.teacherForm.get('firstName').value;
    this.bankingDetailsForm.get('accountHolderName').setValue(adminName);
    this.getBankingDetails();
  }
}


getBankingDetails(){
  this.spinner.show();
  this.teacherService.getuserBankingInfo(this.teacherData).subscribe({
    next:(response)=>{
      if(response.message==='Success'){
        this.bankingDetailsForm.patchValue({
          "id":response.result.id,
          "accountNumber":response.result.accountNumber,
          "bankName":response.result.bankName,
          "bankAddress":response.result.bankAddress,
          "institutionNumber":response.result.institutionNumber,
          "transitNumber":response.result.transitNumber,
          "postalCode":response.result.postalCode,
        });
      };
      setTimeout(() => {
        this.spinner.hide();
      },300);

    },
    error:(err)=>{
      this.spinner.hide();
      this.toastr.error(err.message);
    }
  })


}

validateDocumentForm(){
  if (this.documentForm.invalid || (!this.files.document && this.documentForm.get('id').value < 1)) {
    this.documentForm.markAllAsTouched();
    if (!this.files.document && this.teacherForm.get('id').value < 1) {
        this.filesErrors.document= "This field is required.";
    };
    return false;
  };
  this.filesErrors.document=null;

  return true;

}
getDocumentTypeList(){
  this.spinner.show();
  this.managedaycareservice.getDocumentTypeList().subscribe({
    next:(response)=>{
      if(response.message==='OK'){
        this.documentTypeList=response.result;
      };
      setTimeout(() => {
        this.spinner.hide();
      },300);
    },
    error:(err)=>{
      this.spinner.hide();
      this.toastr.error(err.message);

    }
  })

}
async addDocument(){
  if(this.validateDocumentForm()){
    const document=this.documentForm.value;
    const JsonObject:any={};
    this.documentForm.get('referenceTableID').setValue(this.UserID);
    JsonObject["id"]=document.id;
    JsonObject["referenceTableID"]=document.referenceTableID;
    JsonObject["referenceTableName"]=document.referenceTableName;
    JsonObject["documentTypeID"]=document.documentTypeID;
    JsonObject["documentNumber"]=document.documentNumber;
    JsonObject["loginUserID"]=document.loginUserID;
    JsonObject['documentType']=this.documentTypeList.find(x=>x.id===document.documentTypeID)?.documentType;
    JsonObject['documentDescription']=document.documentDescription;
    JsonObject['referenceTableID']=this.UserID;
    JsonObject['isActive']=document.isActive;
    if(!this.files.document){
      JsonObject["documentImage"]=document.documentImage;
      JsonObject["documentImagePath"]=document.documentImagePath;
    }else{
      JsonObject['readFile']=this.readFiles.document;
      JsonObject['file']=this.files.document;
    };
    if(this.arrayIndex==0||this.arrayIndex>0){
      this.documentList[this.arrayIndex]=JsonObject;

    }else{
      this.documentList.push(JsonObject);
    }
    this.resetDocumentForm();
  }
}

resetDocumentForm(){
  this.readFiles.document=null;
  this.files.document=null;
  this.arrayIndex=null;
  this.documentForm.reset();
  $('#add-document-btn').text('Add');
  this.documentForm.patchValue({
      "id": 0,
      "referenceTableName":"UserMaster",
      "loginUserID":0
  });
}

  onChangeDocumentType(value: string): void {
    let documentType = value.toLowerCase().trim();
    const documentNumberControl = this.documentForm.get('documentNumber') as FormControl;

    switch (documentType) {
        case 'aadharcard':
            documentNumberControl.clearValidators();
            documentNumberControl.addValidators([Validators.pattern('^[0-9]{12}$')]);
            documentNumberControl.addValidators([Validators.required]);
            break;

        case 'pancard':
            documentNumberControl.clearValidators();
            documentNumberControl.addValidators([Validators.pattern('^[A-Z]{5}[0-9]{4}[A-Z]{1}$')]);
            documentNumberControl.addValidators([Validators.required]);
            break;
        case 'votercard':
            documentNumberControl.clearValidators();
            documentNumberControl.addValidators([Validators.pattern('^[A-Z]{3,4}[0-9]{6,7}$')]);
            documentNumberControl.addValidators([Validators.required]);
            break;

        default:
            documentNumberControl.clearValidators();
            break;
    }
    documentNumberControl.updateValueAndValidity();
}

async onSelectDocument(event: any) {
  const document = event.target.files[0];
  if (!document) return;
  if (document.type.startsWith('image/')) {
    const fileContent=await this.readFileAsync(document);
    if(fileContent){
      this.readFiles.document=fileContent;
    };
  } ;
  this.files.document=document;
}

getDocumentList(){
  this.spinner.show();
  this.managedaycareservice.getDocumentList(this.UserID).subscribe({
    next:(response)=>{
      if(response.message==='Success'){
        this.documentList=response.result;
      };
      setTimeout(() => {
        this.spinner.hide();
      },300);
    },
    error:(err)=>{
      this.spinner.hide();
      this.toastr.error(err.message);
    }
  })
}

onEditDocument(document:any,arrayIndex:number){
  this.arrayIndex=arrayIndex;
  if(document?.readFile){
    this.readFiles.document=document.readFile;
    this.files.document=document.file;
  }else{
    this.readFiles.document=this.baseURL+document.documentImagePath+document.documentImage;
  }
  this.documentForm.patchValue({
    "id": document.id,
      "documentTypeID":document.documentTypeID,
      "documentNumber": document.documentNumber,
      "documentImage": document.documentImage,
      "documentImagePath":document.documentImagePath,
      "documentDescription":document.documentDescription,
      "loginUserID":0,
      "isActive":document.isActive,
  });
  $('#add-document-btn').text('Update');
}

getBackgroundImageUrl(document:any): string {
  if (document?.readFile) {
    return `url(${document.readFile})`;
  } else if (document?.documentImagePath && document?.documentImage) {
    return `url(${this.baseURL + document.documentImagePath + document.documentImage})`;
  } else {
    return 'none'; // You can provide a default background image URL if needed
  }
}

activeInactiveDocument(ID:number,isActive:boolean){
  Swal.fire({
    title: 'Confirmation',
    text: isActive ? 'Are you sure you want to inactivate this document?' : 'Are you sure you want to activate this document?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText:'Confirm' ,
    cancelButtonText: 'Cancel'
  }).then((result)=>{
    if(result.isConfirmed){
      this.spinner.show();
      this.commonservice.activeInactiveDocument(ID).subscribe({
        next:(response)=>{
          if(response.message==='Success'){
            this.toastr.success(response.activity);
          };
          setTimeout(() => {
            this.spinner.hide();
          }, 200);
        },
        error:(err)=>{
          this.spinner.hide();
          this.toastr.error(err.message);
        }
      })

    } else {
      const checkbox:any = document.getElementById('check' + ID);
      if (checkbox) {
        checkbox.checked = isActive;
      }
    }
  });
}



async onSubmitDocumentList() {
  const listDocumentWithFiles = this.documentList
    .filter((item: any) => item?.file)
    .map((item: any) => item);

  const formData = new FormData();
  listDocumentWithFiles.map((item: any) => {
    formData.append('files', item.file);
    formData.append('type', 'daycare_document');
  });

  if (formData.has("files")) {
    const fileUploadResponse = await this.UploadFiles(formData);
    fileUploadResponse.result.forEach((item: any, index: number) => {
      listDocumentWithFiles[index]['documentImage'] = item.imageName;
      listDocumentWithFiles[index]['documentImagePath'] = item.path;
    });
  };
  this.documentList = this.documentList.filter((item: any) => !item?.file);
  const mergeList = [...this.documentList, ...listDocumentWithFiles];
  this.managedaycareservice.manageDocument(mergeList).subscribe({
    next: (response) => {
      if (response.message === "Success") {
        const action = this.documentForm.get('id').value > 0 ? "updated" : "added";
        this.toastr.success(`Document ${action} successfully.`);
        this.getDocumentList();
      };
      setTimeout(() => {
        this.spinner.hide();
        
      }, 300);
    },
    error: (err) => {
      this.spinner.hide();
      this.toastr.error(err.message);
    }
  })

}
  get adminFormControls(){
    return this.teacherForm.controls;
  }
  get bankingDetailsFormControls(){
    return this.bankingDetailsForm.controls;
  }
  get documentFormControls(){
    return this.documentForm.controls;
  }
}
