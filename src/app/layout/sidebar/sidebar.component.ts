import {
  Component,
  OnInit,
  Renderer2,
  Output,
  EventEmitter,
  effect,
} from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
} from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { UserPermissionService } from '../../settings/Permission/user-permission/user-permission.service';
import { CommonModule } from '@angular/common';
import { TocRegistrationService } from '../../toc-registration/toc-registration.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { finalize, Subscription } from 'rxjs';
import { debug } from 'console';
import { CommonService } from '../../common-component/common.service';
import { DaycareService } from '../../day-care-management/day-care-settings/daycare.service';

interface ApiResponse {
  message: string | null;
  activity: string | undefined;
  result: any | null;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, CommonModule, ToastrModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  public currentRoute: string = '';
  //Arsh
  private subscription: Subscription | undefined;
  //Arsh
  menus: any;
  dashboardMenu: any;
  loginUserId: any;
  activateRoute: any;
  openedSubmenu: HTMLElement | null = null;
  currentOpenedNestedChild: any = null;
  UserRoleId: any;
  CheckTOCUserDetail: any;
  isDataFullyLoaded: boolean = false;
  isSideBarInitialized: boolean = false;
  bloomvieSettings: any;
  dashboard = new Set([
    'Dashboard',
    'Daycare Dashboard',
    'Teacher Dashboard',
    'Parent Dashboard',
    // 'Toc Dashboard',
    'Counsellor Dashboard',
  ]);
  dashboardRoutes = [
    'daycare-dashboard',
    'dashboard',
    'counsellor-dashboard',
    'teachers-dashboard',
    'parent-dashboard',
  ];

  @Output() sideBarLoad = new EventEmitter<any>();
  centreID: any;
  isSlotAccepted: string = '';
  public isExternalBilling: boolean = typeof localStorage !== 'undefined' && localStorage.getItem('isExternalBilling') === 'true';
  public rawMenus: any[] = [];
  private externalBillingSub?: Subscription;

  constructor(
    private sideBarService: UserPermissionService,
    private cookies: CookieService,
    private renderer: Renderer2,
    private commonService: CommonService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private cookie: CookieService,
    private tocservice: TocRegistrationService,
    private daycareService: DaycareService
  ) {
    effect(() => {
      this.commonService.loadSideBar();
      this.ngOnInit();
    });
  }

  // ngAfterViewInit() {
  //
  //   this.isSideBarInitialized = true;
  //   this.sideBarLoaded();
  // }

  ngOnInit(): void {
    this.isExternalBilling = typeof localStorage !== 'undefined' && localStorage.getItem('isExternalBilling') === 'true';
    this.checkRoute();
    this.loginUserId = this.cookies.get('UserId');
    this.centreID = this.cookies.get('CentreID') || this.cookies.get('centreID');
    const UserInfo = this.cookies.get('UserInfo');
    if (UserInfo) {
      try {
        const parsedInfo = JSON.parse(UserInfo);
        this.UserRoleId = parsedInfo?.result?.userRoleID || parsedInfo?.result?.UserRoleID;
        if (!this.centreID) {
          this.centreID = parsedInfo?.result?.centreID || parsedInfo?.result?.CentreID;
        }
      } catch (e) {}
    } else {
      this.UserRoleId = this.cookies.get('UserRoleId');
    }

    this.externalBillingSub = this.daycareService.externalBilling$.subscribe((enabled: boolean) => {
      this.isExternalBilling = enabled;
      localStorage.setItem('isExternalBilling', enabled ? 'true' : 'false');
      this.applyMenuFilter();
    });

    if (this.centreID) {
      this.daycareService.checkExternalBilling(Number(this.centreID)).subscribe({
        next: (res: any) => {
          if (res && res.result) {
            this.isExternalBilling = !!(res.result.externalBillingEnabled ?? res.result.ExternalBillingEnabled ?? (typeof res.result === 'boolean' ? res.result : false));
            localStorage.setItem('isExternalBilling', this.isExternalBilling ? 'true' : 'false');
            this.applyMenuFilter();
          }
        }
      });
    }
    if (this.UserRoleId == 8) {
      this.isSlotAccepted = this.cookies.get('isSlotAccepted');
    }
    if (this.loginUserId != '') {
      this.getPermissions();
    }

    //Arsh-- 24/01/25
    this.subscription = this.tocservice.refreshSidebar$.subscribe((refresh) => {
      if (refresh) {
        this.isSlotAccepted = this.cookies.get('isSlotAccepted');
        this.getPermissions(); // Call your method to update data
      }
    });

    this.router.events.subscribe(() => {
      this.activateRoute = this.router.url;
    });

    this.getBloomvieSettings();
  }

  checkRoute() {
    const currentPath = this.router.url.split('?')[0];

    switch (currentPath) {
      case '/daycare-dashboard':
        this.setDashboardComponent();
        break;

      case '/dashboard':
        this.setDashboardComponent();
        break;

      case '/counsellor-dashboard':
        this.setDashboardComponent();
        break;

      case '/teachers-dashboard':
        this.setDashboardComponent();
        break;

      case '/parent-dashboard':
        this.setDashboardComponent();
        break;
    }
  }

  setDashboardComponent() {
    this.cookie.set('Component', 'Dashboard');
    this.cookie.delete('ChildComponent');
    this.cookie.delete('NestedChild');
  }

  sideBarLoaded() {
    if (this.isDataFullyLoaded) {
      this.sideBarLoad.emit(true);
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.externalBillingSub) {
      this.externalBillingSub.unsubscribe();
    }
  }
  showChildList(item: any) {
    
    const isOpen = item.isOpen;
    this.resetMenus();
    this.setOpenTrail(item, isOpen);
    this.createParam(item);
  }

  setOpenTrail(item: any, currentIsOpen: boolean): void {
    this.dashboardMenu.id == item.id && this.setDashboardComponent();
    item.isOpen = !currentIsOpen;
    const parent = this.menus.find((menu: any) =>
      menu.childList?.some((child: any) => child.id === item.id)
    );

    if (parent) {
      parent.isOpen = true;
      this.cookie.set('ChildComponent', item.value);
      this.cookie.delete('NestedChild');
      return;
    }

    this.menus.forEach((menu: any) => {
      if (item.id == menu.id) {
        const compVal = (this.isExternalBilling && (item.value === 'Special Offers' || item.menuUrl === 'special-offer')) ? 'Offers' : item.value;
        this.cookie.set('Component', compVal);
        this.cookie.delete('ChildComponent');
        this.cookie.delete('NestedChild');
      }

      menu.childList?.forEach((child: any) => {
        const isNested = child.nestedchildList?.some(
          (nested: any) => nested.id === item.id
        );
        if (isNested) {
          this.cookie.set('NestedChild', item.value);
          child.isOpen = true;
          menu.isOpen = true;
        }
      });
    });
  }

  resetMenus() {
    this.menus.forEach((item: any) => {
      item.isOpen = false;

      if (item.childList && item.childList.length > 0) {
        item.childList.forEach((child: any) => {
          child.isOpen = false;

          if (child.nestedchildList && child.nestedchildList.length > 0) {
            child.nestedchildList.forEach((nested: any) => {
              nested.isOpen = false;
            });
          }
        });
      }
    });

    if (this.dashboardMenu) {
      this.dashboardMenu.isOpen = false;
    }

    this.openedSubmenu = null;
  }
  createParam(item: any) {
    const currentRoute = item.value;
    if (
      currentRoute === 'Home' ||
      currentRoute === 'About Us' ||
      currentRoute === 'Contact Us' ||
      currentRoute === 'For DayCares' ||
      currentRoute === 'For Parents' ||
      currentRoute === 'FAQ' ||
      currentRoute == 'Footer' ||
      currentRoute === 'Features' ||
      currentRoute === 'Pricing' ||
      currentRoute === 'Users' ||
      currentRoute === 'Resources' ||
      currentRoute === 'Job Posting' ||
      currentRoute === 'TOC Registration' ||
      currentRoute === 'Careers' ||
      currentRoute === 'DayCareWelcome'
    ) {
      this.router.navigate([item.menuUrl], {
        queryParams: { Type: item.value },
      });
    }
  }

  getPermissions() {
    
    // this.spinner.show();
    // this.sideBarService.getUserPermissionByUserID(this.loginUserId).pipe(finalize(() => this.spinner.hide())).subscribe({

    this.sideBarService.getUserPermissionByUserID(this.loginUserId).subscribe({
      next: (data) => {
        if (data.message !== 'ok') {
          this.isDataFullyLoaded = true;
          this.sideBarLoaded();
          return;
        }

        const dashboardMenuValues = new Set([
          'Dashboard',
          'Daycare Dashboard',
          'Teacher Dashboard',
          'Parent Dashboard',
          // 'Toc Dashboard',
          'Counsellor Dashboard',
        ]);

        //Added on 30/06/25
        if (this.UserRoleId == 8 && this.isSlotAccepted != 'true') {
          this.rawMenus = data.result.filter(
            (menu: any) => !dashboardMenuValues.has(menu.value)
          );

          const IsCompleteProfile = this.rawMenus.find(
            (x: { value: string }) => x.value == 'Complete Profile'
          );
          if (IsCompleteProfile != null) {
            this.rawMenus = this.rawMenus.filter((x: { value: string }) =>
              [
                'My Profile',
                'My Scheduler',
                'View Slot Requests',
                'Complete Profile',
              ].includes(x.value)
            );
          } else {
            this.rawMenus = this.rawMenus.filter((x: { value: string }) =>
              ['My Profile', 'My Scheduler', 'View Slot Requests'].includes(
                x.value
              )
            );
          }
        } else {
          this.rawMenus = data.result.filter(
            (menu: any) => !dashboardMenuValues.has(menu.value)
          );
        }

        this.applyMenuFilter();

        this.dashboardMenu = data.result.find((menu: any) =>
          dashboardMenuValues.has(menu.value)
        );

        if (!this.dashboardMenu) {
          const roleUrls: { [key: number]: string } = {
            1: 'dashboard',
            2: 'dashboard',
            3: 'daycare-dashboard',
            4: 'teachers-dashboard',
            5: 'parent-dashboard',
            8: this.isSlotAccepted == 'true' ? 'teachers-dashboard' : 'profile'
          };
          this.dashboardMenu = {
            id: -1,
            value: 'Dashboard',
            menuUrl: roleUrls[this.UserRoleId] || 'dashboard',
            isOpen: false
          };
        }

        this.isDataFullyLoaded = true;
        this.sideBarLoaded();

        const currentPath = this.router.url.split('?')[0];
        if (currentPath) {
          this.openMenuPath(data.result, currentPath.replace('/', ''));
        }

        this.commonService.updateBreadcrumb();
      },
      error: (err) => {
        this.toastr.error(err.message);
      },
    });
  }

  private openMenuPath(menuList: any[], currentRoute: string): boolean {
    
    for (const item of menuList) {
      if (item.menuUrl === currentRoute) {
        item.isOpen = true;
        if (!this.dashboardRoutes.includes(currentRoute)) {
          const compVal = (this.isExternalBilling && (item.value === 'Special Offers' || item.menuUrl === 'special-offer')) ? 'Offers' : item.value;
          this.cookie.set('Component', compVal);
          this.cookie.delete('ChildComponent');
          this.cookie.delete('NestedChild');
        }

        return true;
      }

      if (
        item.childList?.length &&
        this.openMenuPath(item.childList, currentRoute)
      ) {
        item.isOpen = true;
        if (!this.dashboardRoutes.includes(currentRoute)) {
          this.cookie.set('ChildComponent', item.value);
          this.cookie.delete('NestedChild');
        }

        return true;
      }

      if (
        item.nestedchildList?.length &&
        this.openMenuPath(item.nestedchildList, currentRoute)
      ) {
        if (!this.dashboardRoutes.includes(currentRoute)) {
          this.cookie.set('NestedChild', item.value);
        }
        item.isOpen = true;
        return true;
      }
    }

    return false;
  }

  getBloomvieSettings() {
    this.commonService
      .getBloomvieSettings(1)
      .subscribe((response: ApiResponse) => {
        if (response.message == 'Success') {
          this.bloomvieSettings = response.result;
        }
      });
  }

  applyMenuFilter() {
    if (!this.rawMenus || this.rawMenus.length === 0) return;
    if (this.isExternalBilling) {
      this.menus = this.filterExternalBillingMenus(this.rawMenus);
    } else {
      this.menus = JSON.parse(JSON.stringify(this.rawMenus));
    }

    const initializeIsOpen = (menu: any) => {
      menu.isOpen = false;
      menu.childList?.forEach(initializeIsOpen);
      menu.nestedchildList?.forEach(initializeIsOpen);
    };
    this.menus.forEach(initializeIsOpen);

    const currentPath = this.router.url.split('?')[0];
    if (currentPath) {
      this.openMenuPath(this.menus, currentPath.replace('/', ''));
    }
  }

  filterExternalBillingMenus(list: any[]): any[] {
    const isBillingItem = (item: any) => {
      const val = (item.value || '').toLowerCase().trim();
      const url = (item.menuUrl || '').toLowerCase().trim();

      // Specifically filter student fees, fee packages/plans, and invoices/payments (keep Special Offers accessible for parent invites)
      if (val === 'student fees' || url === 'student-fees') return true;
      if (url === 'subscription-plans' || url === 'subscription-features') return true;
      if (url.includes('invoice') || val.includes('invoice')) return true;
      if (url.includes('payment') || val.includes('payment')) return true;
      if (url === 'billing-report') return true;

      return false;
    };

    const filterList = (items: any[]): any[] => {
      if (!items) return [];
      return items
        .filter(item => !isBillingItem(item))
        .map(item => {
          const copy = { ...item };
          const val = (copy.value || '').toLowerCase().trim();
          const url = (copy.menuUrl || '').toLowerCase().trim();
          if (val === 'special offers' || url === 'special-offer' || val.includes('special offer') || url.includes('special-offer') || val === 'offers') {
            copy.value = 'Offers';
          }
          if (copy.childList && copy.childList.length > 0) {
            copy.childList = filterList(copy.childList);
          }
          if (copy.nestedchildList && copy.nestedchildList.length > 0) {
            copy.nestedchildList = filterList(copy.nestedchildList);
          }
          return copy;
        });
    };

    return filterList(list);
  }
}
