
import { ChangeDetectorRef, Component } from '@angular/core';
import { LocalizationDetailsComponent } from "../localization-details/localization-details.component";
import { SocialLinksComponent } from "../social-links/social-links.component";
import { RouterLink } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApplicationsSettingsService } from './applications-settings.service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { environment } from '../../../../environments/environment.development';
import { AppService } from '../../../app.service';
import { Title } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import { CookieService } from 'ngx-cookie-service';
import { BreadcrumbComponent } from '../../../common-component/breadcrumb/breadcrumb.component';
declare var $:any

@Component({
  selector: 'app-applications-settings',
  standalone: true,
  imports: [  RouterLink,FormsModule,ReactiveFormsModule,CommonModule, NgxSpinnerModule,SocialLinksComponent,LocalizationDetailsComponent,BreadcrumbComponent  ],
  templateUrl: './applications-settings.component.html',
  styleUrl: './applications-settings.component.css'
})
export class ApplicationsSettingsComponent {
  readonly rootUrl= environment.apiUrl.slice(0,-3);

  
appSetting: any;
  Data: any;
  formsData=new FormData();
  imageMain: any;
  imagefoot: any;
  imagefav: any;
  bloomvie: any;
  pincodeValue: any;
  CentreName: any;
 
constructor(private fb:FormBuilder ,private Appservice:ApplicationsSettingsService,private toastr:ToastrService,
  private spinner:NgxSpinnerService,private appservice:AppService,private Title:Title, private cdr: ChangeDetectorRef ,
  private cookie: CookieService,){
  this.appSetting = this.fb.group({
   id:[0],
   mainLogo:[null,[Validators.required]],
   footerLogo:[null,[Validators.required]],
   businessName:['',[Validators.required]],

   description:['',[Validators.required]],
 
   breadcrumbText:['',[Validators.required]],
   footerText:['',[Validators.required]],
   copyRightText:['',[Validators.required]],
   favicon:[null,[Validators.required]],
  
   
  })

}


ngOnInit(){

  this.getApplicationSetting();
}


// async onSubmit(type:any){
//   if(this.appSetting.valid){
//     this.appSetting.patchValue({
//       id:this.appSetting.value.id==null? 0:this.appSetting.value.id
//     }) 
    
//     //upload file
//   await  this.service.uploadImages(this.formsData,'').subscribe(data=>{
//     if(data.message=="Success"){
//       for (let i = 0; i < data.result.length; i++) {
//         const element = data.result[i];
        
//       if(element.type=="mainLogo"){
//         this.appSetting.patchValue({
//           mainLogo:element.imageName   
//         })
//       }
//       else if(element.type=='footerLogo'){
//         this.appSetting.patchValue({
//           footerLogo:element.imageName
//         })
//       }
//       else if(element.type=='favicon'){
//         this.appSetting.patchValue({
//           favicon:element.imageName
//         })
//       }
//     }
//   }
  
//   }) 

//   await this.service.ManageApplicationSettings(this.appSetting.value).subscribe(data=>{
//     if(data.message=='Success'){
//       this.Data=data.result
//       if(this.appSetting.get('id').value>0){
//     this.formsData = new FormData();
//     this.toastr.success("Data updated successfully !")
//   }
//   else{
// this.toastr.success("Data saved successfully !")
//   }
// }
// })}
// else{
//   this.appSetting.markAllAsTouched();
// }
// }


async onSubmit(type: any) {
  if (this.appSetting.valid) {
    this.spinner.show();
    this.appSetting.patchValue({
      id: this.appSetting.value.id == null ? 0 : this.appSetting.value.id
    });

    try {
      // Upload file
  
      const uploadResponse = await this.uploadImages(this.formsData);

      if (uploadResponse.message === "OK") {
        for (let i = 0; i < uploadResponse.result.length; i++) {
          const element = uploadResponse.result[i];
          if (element.type === "mainLogo") {
           
            this.appSetting.patchValue({
              mainLogo: element.imageName
            });
          } else if (element.type === 'footerLogo') {
            this.appSetting.patchValue({
              footerLogo: element.imageName
            });
          } else if (element.type === 'favicon') {
            this.appSetting.patchValue({
              favicon: element.imageName
            });
          }
        }
      }

      //const manageResponse = await this.manageApplicationSettings(this.appSetting.value);  
      const manageResponse = await this.Appservice.ManageApplicationSettings(this.appSetting.value).toPromise();
      if (manageResponse.message === 'Success') {
        this.Appservice.GetApplicationSetting().subscribe(data=>{
          this.appservice.changeFavicon(this.rootUrl+'Content/Image/favicon/'+data.result.favicon)
          this.Title.setTitle(data.result.businessName)
         this.bloomvie= $("#name").text(data.result.businessName);
       
        //  this.imageMain=this.rootUrl+'Content/Image/mainLogo/'+data.result.mainLogo;
         this.Appservice.setImage(this.imageMain)
        //  this.Appservice.setImage(data.result.businessName)
        })
        this.Data = manageResponse.result;
        this.CentreName = manageResponse.result.businessName;
            this.cookie.set('CentreName', this.CentreName);
        if (this.appSetting.get('id').value > 0) {
          
          this.spinner.show();
           this.formsData = new FormData();
          this.toastr.success("Data updated successfully!");
          // this.Appservice.GetApplicationSetting().subscribe(data=>{
          //   this.appservice.changeFavicon(this.rootUrl+'Content/Image/favicon/'+data.result.favicon)
          //   this.Title.setTitle(data.result.businessName)
          //  this.bloomvie= $("#name").text(data.result.businessName);
         
          //  this.imageMain=this.rootUrl+'Content/Image/mainLogo/'+data.result.mainLogo;
          //  this.Appservice.setImage(this.imageMain)
          // //  this.Appservice.setImage(data.result.businessName)
          // })
        } else {
          this.toastr.success("Data saved successfully!");
        }
        this.spinner.hide();
      }
    } catch (error) {      
      console.error(error);
    }
  } else {
    this.appSetting.markAllAsTouched();
  }
}


// Helper method to handle file upload
uploadImages(formsData: FormData): Promise<any> {
  return new Promise((resolve, reject) => {
    this.Appservice.uploadImages(formsData, '').subscribe({
      next: (data) => resolve(data),
      error: (err) => reject(err)
    });
  });
}

// Helper method to handle manage application settings
// manageApplicationSettings(appSetting: any): Promise<any> {
//   return new Promise((resolve, reject) => {
//     this.service.ManageApplicationSettings(appSetting).subscribe({
//       next: (data) => resolve(data),
//       error: (err) => reject(err)
//     });
//   });
// }


 get input(){
return this.appSetting.controls;
}


getApplicationSetting(){

  // this.spinner.show();
  this.Appservice.GetApplicationSetting().subscribe(data=>{
    if(data.message=='Success')
    {      
      this.Data=data.result; 
      this.appSetting.patchValue({
        id:this.Data.id,
        mainLogo:this.Data.mainLogo,
        footerLogo:this.Data.footerLogo,
        businessName:this.Data.businessName,
       
        description:this.Data.description,
       
        breadcrumbText:this.Data.breadcrumbText,
        footerText:this.Data.footerText,
        copyRightText:this.Data.copyRightText,
        favicon:this.Data.favicon,
        
      });
      this.imageMain = this.rootUrl + 'Content/Image/mainLogo/' + this.appSetting.value.mainLogo;
      this.imagefoot = this.rootUrl + 'Content/Image/footerLogo/' + this.appSetting.value.footerLogo;
      this.imagefav = this.rootUrl + 'Content/Image/favicon/' + this.appSetting.value.favicon;
      // this.spinner.hide();
    }
  })
}


fileChange(event:any,type:any){



if(type=="mainLogo"){
this.appSetting.get('mainLogo').clearValidators();
this.appSetting.get('mainLogo').updateValueAndValidity();
}
else if(type=="footerLogo"){
  this.appSetting.get('footerLogo').clearValidators();
  this.appSetting.get('footerLogo').updateValueAndValidity(); 
}
else if(type=="favicon"){
  this.appSetting.get('favicon').clearValidators();
  this.appSetting.get('favicon').updateValueAndValidity(); 
}

const files=  event.target.files;

if(files.length===0){
  return;
}


const file=files[0];
// if (!this.allowedFileTypes.includes(file.type)) {
//   return ;
// }

const reader=new FileReader();
reader.onload=()=>{
if(type=="mainLogo"){
  
    this.imageMain=reader.result
    
  }

 else if(type=="footerLogo"){
  
    this.imagefoot=reader.result
   
  
}
else if(type=="favicon"){
  
    this.imagefav=reader.result
  
}
}

const params=[type];
this.formsData.append('files',file);
this.formsData.append('type',params.toString());


reader.readAsDataURL(file);

}


reset(){
  this.appSetting.reset();
  this.appSetting.reset({
    id:0,
 
    businessName:'',
   
    description:'',
   
    breadcrumbText:'',
    footerText:'',
  
  });
  this.imageMain=null;
  this.imagefoot=null;
  this.imagefav=null;  
}


pincodeCheck() {

  this.pincodeValue = $('#pincode').val();

  if (this.pincodeValue.length === 6) {
    const xhr = new XMLHttpRequest();
    const url = `https://api.postalpincode.in/pincode/${this.pincodeValue}`;
    xhr.open('GET', url);
    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        if (response[0].Status === 'Success') {
          const postOffice = response[0].PostOffice[0];
          $('#cityID').val(postOffice.District);
          $('#stateID').val(postOffice.State);
          $('#countryID').val(postOffice.Country);

          this.appSetting.patchValue({
            cityName: postOffice.District,
            stateName: postOffice.State,
            countryName: postOffice.Country,
          });
        } else {
          $('#cityID').val('');
          $('#stateID').val('');
          $('#pincode').val('');
          $('#countryID').val('');
          console.error(`Request failed. Status: ${response[0].Message}`);
          Swal.fire({
            icon: 'warning',
            title: '<h3>Warning!</h3>',
            text: 'Please enter a valid PIN code.',
          });
        }
      } else {
        console.error(`Request failed. Status: ${xhr.status}`);
        // Handle other status codes if necessary
      }
    };
    xhr.send();
  }
  else {
    $('#cityID').val('');
          $('#pincode').val('');
          $('#stateID').val('');
          $('#countryID').val('');
    Swal.fire({
      icon: 'warning',
      title: '<h3>Warning!</h3>',
      text: 'Pincode must be 6 digits long.',
    });
  }
}

}
