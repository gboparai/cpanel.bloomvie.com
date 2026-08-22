import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  ActivatedRoute,
  RouterLink,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ChatSocketService } from '../common-component/chatbox/chat-socket.service';
import { CommonModule } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { CookieService } from 'ngx-cookie-service';
import { CommonService } from '../common-component/common.service';
import { LoginService } from '../login/login.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterModule,
    HeaderComponent,
    SidebarComponent,
    CommonModule,
  ],
  providers: [ChatSocketService],

  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent implements OnInit, OnDestroy {
  isLoading = true;
  isHeaderLoad: boolean = false;
  isSideLoad: boolean = false;

  headerLoadingState: boolean = false;
  sidebarLoadingState: boolean = false;

  constructor(
    private chatService: ChatSocketService,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private cookie: CookieService,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    // let token: any;
    // this.route.queryParams.subscribe((params: any) => {
    //   token = params['urlToken'];
    //   if (token) {
    //     this.commonService.TokenMatchQueryParam(token).subscribe({
    //       next: (response) => {
    //         const data = response;
    //         const jwtToken = response.token;
    //         if (jwtToken) {
    //           data.result['token'] = jwtToken;
    //           let userInfo = JSON.stringify(data);
    //           this.cookie.set('UserInfo', userInfo);
    //         }
    //         if (data) {
    //           this.cookie.set('CentreID', data.result.centreID);
    //           this.cookie.set('UserId', data.result.id);
    //           this.cookie.set('UserRoleId', data.result.userRoleID);
    //           this.cookie.set('email', data.result.email);
    //         }
    //       },
    //     });
    //   }
    // });
    this.startChat();
  }

  private startChat(): void {
    this.chatService.startConnection();
  }

  ngOnDestroy(): void {
    this.chatService.stopConnection();
  }

  isComponentLoadinHeader(isLoad: boolean) {
    this.isHeaderLoad = isLoad;
    this.hideSpinner();
  }

  isComponentLoadinSideBar(isLoad: boolean) {
    this.isSideLoad = isLoad;
    this.hideSpinner();
  }

  hideSpinner() {
    if (this.isHeaderLoad && this.isSideLoad) {
      this.isLoading = false;
    }
  }
}
