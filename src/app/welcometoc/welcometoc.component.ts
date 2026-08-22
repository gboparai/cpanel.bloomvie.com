import { Component } from '@angular/core';
import { HeaderComponent } from '../layout/header/header.component';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { TOCRegistrationComponent } from '../toc-registration/toc-registration.component';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { TocRegistrationService } from '../toc-registration/toc-registration.service';
import * as CryptoJS from 'crypto-js';
@Component({
  selector: 'app-welcometoc',
  standalone: true,
  imports: [HeaderComponent,RouterLink,
    RouterModule,TOCRegistrationComponent],
  templateUrl: './welcometoc.component.html',
  styleUrl: './welcometoc.component.css'
})
export class WelcometocComponent {
  ParamID: string | null | undefined;
  UserID: any;
  CheckUserDetail: any;

  constructor(private router: Router, private cookieService: CookieService, private route: ActivatedRoute,  
    private toastr:ToastrService,private tocservice : TocRegistrationService) {
  }


  ngOnInit(): void {
  //   this.ParamID = this.route.snapshot.queryParamMap.get('id');
  //   if (this.ParamID) {
  //     //  alert(`Query parameter ID: ${this.ParamID}`);
  //          const secretKey = 'encrypt!135790';
  //          this.UserID = CryptoJS.AES.decrypt(this.ParamID, secretKey).toString(CryptoJS.enc.Utf8);
  //         this.getTOCUserDetailByEmail(this.UserID);

  //   setTimeout(() => {
  //     window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  //   }, 0);
  // }

  this.route.queryParamMap.subscribe(params => {
    this.ParamID = params.get('id');
    if (this.ParamID) {
      const secretKey = 'encrypt!135790';
      try {
        const bytes = CryptoJS.AES.decrypt(this.ParamID, secretKey);
        this.UserID = bytes.toString(CryptoJS.enc.Utf8);
  
        if (!this.UserID) {
          throw new Error('Decryption failed');
        }
        this.getTOCUserDetailByEmail(this.UserID);
      } catch (error) {
        //console.error('Decryption error:', error.message);
      }
    }
  });
  
}


getTOCUserDetailByEmail(userid:any) {
  this.tocservice.getTOCUserDetailByID(userid,0).subscribe(
    (data) => {
      if (data.message === "ok") {
        this.CheckUserDetail = data.result;
        if(this.CheckUserDetail.partTimeStartDate!=null){
        //  this.router.navigate(['/login']);
        this.router.navigate(['/toc-dashboard']);
        }
      } else {
        this.CheckUserDetail = [];
      }
    },
    (error) => {
      console.error('Error occurred while checking email:', error);
    }
  );
}


  RedirectToTocRegistration(){
  this.router.navigate(['/TOC-registration'], {
   queryParams: { id: this.ParamID }
  });
  }
}
