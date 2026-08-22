import { Component, effect, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { UserPermissionService } from '../../settings/Permission/user-permission/user-permission.service';
import { CommonModule } from '@angular/common';
import { CommonService } from '../common.service';
import { ApplicationsSettingsService } from '../../settings/application-settings/applications-settings/applications-settings.service';
declare var $: any;
@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css',
})
export class BreadcrumbComponent implements OnInit {
  centreName: any;
  loginUserId: any;
  Component: any;
  ChildComponent: any;
  Breadcrumb: any;
  Breadcrumb1: any;
  nestedChild: string = '';

  constructor(
    private cookies: CookieService,
    private applicationservice: ApplicationsSettingsService,
    private CommonService: CommonService
  ) {
    effect(() => {
      this.CommonService.loadBreadcrumbSignal();
      this.getBreadcrumbCookies();
    });
  }

  ngOnInit(): void {
    this.centreName = this.cookies.get('CentreName');
    this.getBreadcrumbCookies();
    this.loginUserId = this.cookies.get('UserId');
    this.applicationservice.GetApplicationSetting().subscribe((data) => {
      if (data.message == 'Success') {
        this.Breadcrumb = $('#breadcrumb').text(data.result.breadcrumbText);
        this.Breadcrumb1 = $('#breadcrumb1').text(data.result.breadcrumbText);
      }
    });
  }
  getBreadcrumbCookies() {
    this.Component = this.cookies.get('Component');
    this.nestedChild = this.cookies.get('NestedChild');
    this.ChildComponent = this.cookies.get('ChildComponent');
  }
}
