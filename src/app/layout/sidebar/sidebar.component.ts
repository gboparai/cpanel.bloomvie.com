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
    private tocservice: TocRegistrationService
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
    this.checkRoute();
    this.loginUserId = this.cookies.get('UserId');
    this.centreID = this.cookies.get('CentreID');
    this.UserRoleId = this.cookies.get('UserRoleId');
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

    const UserInfo = this.cookies.get('UserInfo');
    if (UserInfo) {
      const parsedInfo = JSON.parse(UserInfo);
      this.UserRoleId = parsedInfo.result.userRoleID;
    }

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
        this.cookie.set('Component', item.value);
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
          this.menus = data.result.filter(
            (menu: any) => !dashboardMenuValues.has(menu.value)
          );

          const IsCompleteProfile = this.menus.find(
            (x: { value: string }) => x.value == 'Complete Profile'
          );
          if (IsCompleteProfile != null) {
            this.menus = this.menus.filter((x: { value: string }) =>
              [
                'My Profile',
                'My Scheduler',
                'View Slot Requests',
                'Complete Profile',
              ].includes(x.value)
            );
          } else {
            this.menus = this.menus.filter((x: { value: string }) =>
              ['My Profile', 'My Scheduler', 'View Slot Requests'].includes(
                x.value
              )
            );
          }
        } else {
          this.menus = data.result.filter(
            (menu: any) => !dashboardMenuValues.has(menu.value)
          );
        }

        //commented on 30/06/25
        // this.menus = data.result.filter(
        //   (menu: any) => !dashboardMenuValues.has(menu.value)
        // );

        // Reset isOpen for all menus
        const initializeIsOpen = (menu: any) => {
          menu.isOpen = false;
          menu.childList?.forEach(initializeIsOpen);
          menu.nestedchildList?.forEach(initializeIsOpen);
        };
        this.menus.forEach(initializeIsOpen);

        this.dashboardMenu = data.result.find((menu: any) =>
          dashboardMenuValues.has(menu.value)
        );

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
          this.cookie.set('Component', item.value);
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
}
