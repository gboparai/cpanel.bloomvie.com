import { Component, effect, OnInit, Optional } from '@angular/core';
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
    @Optional() private cookies?: CookieService,
    @Optional() private applicationservice?: ApplicationsSettingsService,
    @Optional() private CommonService?: CommonService
  ) {
    if (this.CommonService && typeof this.CommonService.loadBreadcrumbSignal === 'function') {
      effect(() => {
        this.CommonService?.loadBreadcrumbSignal?.();
        this.getBreadcrumbCookies();
      });
    }
  }

  ngOnInit(): void {
    this.centreName = this.cookies?.get ? this.cookies.get('CentreName') : '';
    this.getBreadcrumbCookies();
    this.loginUserId = this.cookies?.get ? this.cookies.get('UserId') : '';
    if (this.applicationservice && this.applicationservice.GetApplicationSetting) {
      this.applicationservice.GetApplicationSetting().subscribe((data) => {
        if (data && data.message == 'Success' && data.result) {
          if (typeof $ === 'function') {
            this.Breadcrumb = $('#breadcrumb')?.text?.(data.result.breadcrumbText);
            this.Breadcrumb1 = $('#breadcrumb1')?.text?.(data.result.breadcrumbText);
          }
        }
      });
    }
  }
  getBreadcrumbCookies() {
    this.Component = this.cookies ? this.cookies.get('Component') : '';
    const isExt = typeof localStorage !== 'undefined' && localStorage.getItem('isExternalBilling') === 'true';
    if (isExt && (this.Component === 'Special Offers' || this.Component === 'Discount Details')) {
      this.Component = 'Enrollment Invites';
    }
    this.nestedChild = this.cookies ? this.cookies.get('NestedChild') : '';
    this.ChildComponent = this.cookies ? this.cookies.get('ChildComponent') : '';
  }
}
