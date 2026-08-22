import { Component } from '@angular/core';
import { HeaderComponent } from '../layout/header/header.component';
import { OnboardingComponent } from '../onboarding/onboarding.component';
import { SkeletonLoaderComponent } from '../common-component/skeleton-loader/skeleton-loader.component';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterModule,
} from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { CommonService } from '../common-component/common.service';
import { ProfileService } from '../common-component/profile/profile.service';
import { UserRoleService } from '../settings/Permission/user-role/user-role.service';
import { WelcomeService } from './welcome.service';
import { LoginService } from '../login/login.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';

declare var $: any;

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [
    CarouselModule,
    HeaderComponent,
    OnboardingComponent,
    RouterLink,
    RouterModule,
    SkeletonLoaderComponent,
    CommonModule,
  ],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css',
})
export class WelcomeComponent {
  readonly rootUrl = environment.apiUrl.slice(0, -3);
  customOptions: OwlOptions = {
    loop: true,
    autoplay: true,
    autoplayTimeout: 3000,
    smartSpeed: 1000,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 700,
    navText: ['<', '>'],
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 1,
      },
      740: {
        items: 1,
      },
      940: {
        items: 1,
      },
      1200: {
        items: 1,
      },
      1500: {
        items: 1,
      },
      1800: {
        items: 1,
      },
    },
    nav: false,
  };
  skeletonShow: boolean = true;
  customOptions1: OwlOptions = {
    loop: true,

    autoplay: true,
    autoplayTimeout: 3000,
    smartSpeed: 1000,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 700,
    navText: ['<', '>'],
    responsive: {
      0: {
        items: 4,
      },
      400: {
        items: 4,
      },
      740: {
        items: 4,
      },
      940: {
        items: 4,
      },
      1200: {
        items: 4,
      },
      1500: {
        items: 4,
      },
      1800: {
        items: 4,
      },
    },
    nav: false,
  };

  daycareName: any;
  UserId: any;
  UserRoleId: any;
  CentreID: any;
  Token: any;
  Userdata: any;
  role: any;
  userRoleID: any;
  email: any;
  password: any;
  userInfo: any;
  dayCareContent: any;
  dayCareLogo: any;
  dayCareGallery: any[] = [];
  centreid: any;
  DayCarecentreID: any;
  DaycareID: any;
  orderNumber: string = '';

  constructor(
    private router: Router,
    private cookieService: CookieService,
    private route: ActivatedRoute,
    private commonservice: CommonService,
    private profileService: ProfileService,
    private welcomeService: WelcomeService,
    private roleservice: UserRoleService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private loginService: LoginService
  ) {}

  async ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.orderNumber = params['orderNumber'];
      let enrolledStudentID = params['StudentID'];

      if (this.orderNumber) {
        const decryptedOrderNumber = this.commonservice.decrypt(
          this.orderNumber.toString()
        );
        decryptedOrderNumber &&
          this.cookieService.set(
            'orderNumber',
            decryptedOrderNumber,
            undefined,
            '/'
          );
      }
      if (enrolledStudentID) {
        const decryptEnrolledStudentID = this.commonservice.decrypt(
          enrolledStudentID.toString()
        );
        decryptEnrolledStudentID &&
          this.cookieService.set(
            'StudentID',
            decryptEnrolledStudentID,
            undefined,
            '/'
          );
        this.getCentreIDByStudentID();
      }

      this.Token = params['token'];
      if (this.Token) {
        this.tokenMatch(); // token match will set the cookies for user data
      }
    });

    // const UserInfo = this.cookieService.get('UserInfo');
    this.daycareName = this.cookieService.get('CentreName');

    // Check if UserInfo exists before parsing
    // if (UserInfo) {
    //   const parsedInfo = JSON.parse(UserInfo);
    //   this.UserId = this.cookieService.get('UserId') || parsedInfo.result.id;
    //   this.CentreID = this.cookieService.get('CentreID');
    //   this.UserRoleId = parsedInfo.result.userRoleID;
    // }
  }

  async getCentreIDByStudentID() {
    let studentID = parseInt(this.cookieService.get('StudentID'));
    let data = await this.welcomeService
      .getCentreIDByStudentID(studentID)
      .toPromise();
    if (data.message == 'Success') {
      this.cookieService.set('CentreID', data.result.centreID, undefined, '/');
      this.cookieService.set(
        'CentreAdminID',
        data.result.centreAdminID,
        undefined,
        '/'
      );
    }
  }

  getDayCareFeatureByCentreID(DaycareID: any) {
    this.welcomeService
      .getDayCareFeatureByCentreID(DaycareID)
      .subscribe((data) => {
        if (data.message === 'OK') {
          this.dayCareGallery = data.result;
          
        } else {
          this.dayCareGallery = [];
        }
      });
  }

  GetUserRoles() {
    if (!this.UserRoleId) {
      console.error('UserRoleId is not defined!');
      return;
    }

    this.roleservice.getUserRolesByID(this.UserRoleId).subscribe({
      next: (data) => {
        if (data.message === 'Ok') {
          this.role = data.result.userRole;
        } else {
          console.error('Error fetching user role:', data.message);
        }
      },
      error: (err) => {
        console.error('Error in GetUserRoles:', err);
      },
    });
  }

  startOnboarding() {
    if (this.UserRoleId == 5) {
      this.router.navigate(['/parent-onboarding']);
    } else if (this.UserRoleId == 3) {
      if (this.CentreID > 0) {
        const enc_id = this.commonservice.encrypt(this.CentreID.toString());
        this.router.navigate(['/onboarding'], {
          queryParams: { enc_id: enc_id },
        });
      } else {
        this.router.navigate(['/onboarding']);
      }
    }
  }

  tokenMatch() {
    this.commonservice.TokenMatchQueryParam(this.Token).subscribe({
      next: (data) => {
        if (data.message === 'Success') {
          this.UserId = data.result.id;
          const parsedInfo = data.result;
          this.cookieService.set('UserId', this.UserId, undefined, '/');
          this.cookieService.set(
            'UserInfo',
            JSON.stringify(data),
            undefined,
            '/'
          );

          // Arsh -- Set CentreID when direct from front-end to Welcome Page.
          if (data.result.centreID) {
            this.CentreID = data.result.centreID;
            this.cookieService.set(
              'CentreID',
              data.result.centreID,
              undefined,
              '/'
            );
          }

          this.cookieService.set(
            'userRoleID',
            data.result.userRoleID,
            undefined,
            '/'
          );

          // this.getCentreIDByStudentID();

          // Set UserRoleId and call GetUserRoles after setting the cookies
          this.UserRoleId = data.result.userRoleID;
          if (this.UserRoleId) {
            this.GetUserRoles();
            if (this.UserRoleId == 3) {
              this.AllDayCareContent();
              this.getDayCareFeatureByCentreID(this.CentreID);
              this.getAllDayCareContentLogo();
            } else {
              if (this.UserRoleId == 5) {
                // this.getDayCareFeatureByCentreID(this.CentreID);
              }
            }
          }

          this.loginService.loadUserFromStorage();
        } else {
          this.toastr.warning(data.message);
        }

        setTimeout(() => {
          this.spinner.hide();
        }, 300);
      },
      error: (err) => {
        this.toastr.error(err.message);
        console.error('Error during token match:', err);
      },
    });
  }

  AllDayCareContent() {
    this.spinner.show();
    this.welcomeService.getAllDayCareContent().subscribe({
      next: (data) => {
        this.skeletonShow = false;
        if (data.message === 'OK') {
          this.spinner.hide();
          this.dayCareContent = data.result.map((item: any) => {
            return {
              ...item,
              s3ImageUrl: item.s3ImageUrl
                ? this.commonservice.convertS3File(item.s3ImageUrl)
                : '',
            };
          });
        } else {
          this.spinner.hide();
        }
      },
    });
  }

  getAllDayCareContentLogo() {
    this.spinner.show();
    this.welcomeService.getAllDayCareContentLogo().subscribe({
      next: (data) => {
        if (data.message === 'OK') {
          this.spinner.hide();
          this.dayCareLogo = data.result;
        } else {
          this.spinner.hide();
        }
      },
    });
  }
}
