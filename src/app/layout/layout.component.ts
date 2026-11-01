import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  RouterLink,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ChatSocketService } from '../common-component/chatbox/chat-socket.service';
import { CommonModule } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';

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
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
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
