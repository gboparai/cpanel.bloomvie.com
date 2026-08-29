import { environment } from './../environments/environment';
import { ApplicationsSettingsComponent } from './settings/application-settings/applications-settings/applications-settings.component';
import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import {
  ActivatedRoute,
  RouterLink,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './bloomvie-management/dashboard/dashboard.component';
import { BreadcrumbComponent } from './common-component/breadcrumb/breadcrumb.component';

import { ChatboxComponent } from './common-component/chatbox/chatbox.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { OTPComponent } from './otp/otp.component';
import { PasswordChangeComponent } from './password-change/password-change.component';

import { LocalizationDetailsComponent } from './settings/application-settings/localization-details/localization-details.component';

import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { SocialLinksComponent } from './settings/application-settings/social-links/social-links.component';
import { NgxSpinnerModule } from 'ngx-spinner';

import { ApplicationsSettingsService } from './settings/application-settings/applications-settings/applications-settings.service';
import { Title } from '@angular/platform-browser';
import { AppService } from './app.service';
import { CookieService } from 'ngx-cookie-service';
import { ProfileService } from './common-component/profile/profile.service';
import { TocDashboardComponent } from './toc-dashboard/toc-dashboard.component';
import { ChatSocketService } from './common-component/chatbox/chat-socket.service';
import { CommonService } from './common-component/common.service';

declare var $: any;
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterModule,
    LayoutComponent,
    LoginComponent,
    DashboardComponent,
    BreadcrumbComponent,
    ChatboxComponent,
    ForgotPasswordComponent,
    OTPComponent,
    PasswordChangeComponent,
    NgxSpinnerModule,
    SocialLinksComponent,
    LocalizationDetailsComponent,
    ApplicationsSettingsComponent,
  ],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'Kinder-Hub';

  readonly rootUrl = environment.apiUrl.slice(0, -3);

  constructor(
    private service: ApplicationsSettingsService,
    private Title: Title,
    private appservice: AppService,
    private cookie: CookieService,
    private route: ActivatedRoute,
    private commonService: CommonService
  ) {}

  ngOnInit() {
    const dataColor = this.cookie.get('theme-color');
    if (dataColor)
      document.documentElement.style.setProperty('--main-color', dataColor);
    else document.documentElement.style.setProperty('--main-color', '#a2719e');

    // this.GetApplicationSettings();

    // Use type assertion to specify the expected type of the selected element
    const switcherBtn = document.querySelector(
      '.switcher-btn'
    ) as HTMLElement | null;
    const colorSwitcher = document.querySelector(
      '.color-switcher'
    ) as HTMLElement | null;
    const themeButtons =
      document.querySelectorAll<HTMLElement>('.theme-buttons');

    if (switcherBtn && colorSwitcher) {
      // Add click event listener to switcher button
      switcherBtn.onclick = () => {
        colorSwitcher.classList.toggle('active');
      };
    }

    themeButtons.forEach((color) => {
      color.addEventListener('click', () => {
        const dataColor = color.getAttribute('data-color');
        if (dataColor) {
          this.cookie.set('theme-color', dataColor);
          document.documentElement.style.setProperty('--main-color', dataColor);
        }
      });
    });
    // let token:any
    // this.route.queryParams.subscribe((params: any) => {
    //   setTimeout(() => {
    //     token = params['urlToken'];
    //   }, 3000);

    //   });
    //   if (token) {
    //     this.commonService.TokenMatchQueryParam(token).subscribe({
    //       next: (response => {
    //         const data = response;
    //         const jwtToken = response.token;
    //         if (jwtToken) {
    //           data.result['token'] = jwtToken;
    //           let userInfo = JSON.stringify(data);
    //           this.cookie.set('UserInfo', userInfo);
    //         }
    //         if(data){
    //           this.cookie.set('CentreID',data.result.centreID);
    //           this.cookie.set('UserId',data.result.id);
    //           this.cookie.set('UserRoleId',data.result.userRoleID);
    //           this.cookie.set('email',data.result.email);
    //         }
    //       })
    //     })
    //   }
  }
  ngAfterViewInit(): void {
    this.hidePreloader();
  }
  private hidePreloader(): void {
    setTimeout(() => {
      let preloader = document.getElementById(
        'preloader'
      ) as HTMLElement | null;
      if (preloader != null) {
        // Apply overlay style when visible
        preloader.style.opacity = '0.7';
        preloader.style.background = '#000';

        // Fade out
        preloader.style.transition = 'opacity 0.5s ease-out';
        preloader.style.opacity = '0';

        setTimeout(() => {
          preloader!.style.display = 'none';
        }, 500);
      } else {
        console.warn('Preloader element not found!');
      }
    }, 500);
  }

  // GetApplicationSettings() {
  //   this.service.GetApplicationSetting().subscribe(data => {
  //     if (data.message == 'Success') {
  //       const faviconPath = data.result.favicon;
  //       const imagePath = faviconPath && faviconPath.trim() !== ''
  //         ? this.rootUrl + 'Content/Image/favicon/' + faviconPath
  //         : 'assets/img/favicon.png'; // fallback static icon

  //       this.appservice.changeFavicon(imagePath);
  //       this.Title.setTitle("Bloomvie")

  //     }
  //   })
  // }
}
