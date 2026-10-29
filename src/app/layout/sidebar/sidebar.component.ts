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
  public isExternalBilling: boolean = false;
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

    if (typeof localStorage !== 'undefined') {
      const scopedKey = this.centreID ? `isExternalBilling_${this.centreID}` : null;
      const scopedVal = scopedKey ? localStorage.getItem(scopedKey) : null;
      if (scopedVal !== null) {
        this.isExternalBilling = scopedVal === 'true';
      } else {
        this.isExternalBilling = localStorage.getItem('isExternalBilling') === 'true';
      }
    }

    this.externalBillingSub = this.daycareService.externalBilling$.subscribe((enabled: boolean) => {
      this.isExternalBilling = enabled;
      if (typeof localStorage !== 'undefined') {
        if (this.centreID) {
          localStorage.setItem(`isExternalBilling_${this.centreID}`, enabled ? 'true' : 'false');
        }
        localStorage.setItem('isExternalBilling', enabled ? 'true' : 'false');
      }
      this.applyMenuFilter();
    });

    if (this.centreID) {
      this.daycareService.checkExternalBilling(Number(this.centreID)).subscribe({
        next: (res: any) => {
          if (res && res.result) {
            this.isExternalBilling = !!(res.result.externalBillingEnabled ?? res.result.ExternalBillingEnabled ?? (typeof res.result === 'boolean' ? res.result : false));
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem(`isExternalBilling_${this.centreID}`, this.isExternalBilling ? 'true' : 'false');
              localStorage.setItem('isExternalBilling', this.isExternalBilling ? 'true' : 'false');
            }
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
      const compVal = (this.isExternalBilling && (item.value === 'Special Offers' || item.menuUrl === 'special-offer' || item.menuUrl === '/special-offer')) ? 'Enrollment Invites' : item.value;
      this.cookie.set('ChildComponent', compVal);
      this.cookie.delete('NestedChild');
      return;
    }

    this.menus.forEach((menu: any) => {
      if (item.id == menu.id) {
        const compVal = (this.isExternalBilling && (item.value === 'Special Offers' || item.menuUrl === 'special-offer')) ? 'Enrollment Invites' : item.value;
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

        this.rawMenus.forEach((m: any) => { if (m.menuUrl === '/manage-announcements' || m.menuUrl === 'manage-announcements') { m.menuUrl = '/announcements'; } if (m.MenuUrl === '/manage-announcements' || m.MenuUrl === 'manage-announcements') { m.MenuUrl = '/announcements'; } });


        if (this.UserRoleId == 5) {
          const annIndex = this.rawMenus.findIndex((m: any) =>
            m.menuUrl === '/announcements' || m.menuUrl === 'announcements' || m.menuUrl === '/manage-announcements' || m.menuUrl === 'manage-announcements' || m.value === 'Announcements'
          );
          const chatBoxIndex = this.rawMenus.findIndex((m: any) =>
            m.menuUrl === 'chatbox' || m.menuUrl === '/chatbox' || m.value === 'ChatBox'
          );

          if (annIndex === -1) {
            const announcementMenu = {
              id: 179,
              value: 'Announcements',
              icon: 'feather-volume-2',
              Icon: 'feather-volume-2',
              menuUrl: '/announcements',
              MenuUrl: '/announcements',
              childList: []
            };
            if (chatBoxIndex !== -1) {
              this.rawMenus.splice(chatBoxIndex, 0, announcementMenu);
            } else {
              this.rawMenus.push(announcementMenu);
            }
          } else if (chatBoxIndex !== -1) {
            const [annMenu] = this.rawMenus.splice(annIndex, 1);
            const targetChatIndex = this.rawMenus.findIndex((m: any) =>
              m.menuUrl === 'chatbox' || m.menuUrl === '/chatbox' || m.value === 'ChatBox'
            );
            this.rawMenus.splice(targetChatIndex, 0, annMenu);
          }
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
    const matchRoute = (itemUrl: string, current: string) => {
      if (!itemUrl || !current) return false;
      const cleanItem = itemUrl.replace(/^\/+/, '');
      const cleanCurrent = current.replace(/^\/+/, '');
      return cleanItem === cleanCurrent;
    };

    for (const item of menuList) {
      if (matchRoute(item.menuUrl, currentRoute)) {
        item.isOpen = true;
        if (!this.dashboardRoutes.includes(currentRoute)) {
          const compVal = (this.isExternalBilling && (item.value === 'Special Offers' || item.menuUrl === 'special-offer' || item.menuUrl === '/special-offer')) ? 'Enrollment Invites' : item.value;
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

  organizeStudentManagementMenu(menus: any[]): any[] {
    if (this.UserRoleId != 3 && this.UserRoleId != 1 && this.UserRoleId != 2) {
      return menus;
    }

    const cloned: any[] = JSON.parse(JSON.stringify(menus));

    let specialOfferMenu: any = null;
    let addStudentMenu: any = null;
    let viewStudentMenu: any = null;
    let studentMgmtMenu: any = null;

    const isOffer = (m: any) => {
      const url = (m.menuUrl || m.MenuUrl || '').toLowerCase();
      const val = (m.value || '').toLowerCase();
      return url.includes('special-offer') || val.includes('special offer') || val.includes('enrollment invite') || val === 'offers';
    };

    const isAddStudent = (m: any) => {
      const url = (m.menuUrl || m.MenuUrl || '').toLowerCase();
      const val = (m.value || '').toLowerCase();
      return url.includes('manage-student') || url.includes('student-enrollment') || val.includes('add student') || val === 'add student';
    };

    const isViewStudent = (m: any) => {
      const url = (m.menuUrl || m.MenuUrl || '').toLowerCase();
      const val = (m.value || '').toLowerCase();
      return url.includes('view-student') || val === 'view students' || val === 'students list';
    };

    const isStudentMgmtParent = (m: any) => {
      const val = (m.value || '').toLowerCase().trim();
      return val === 'student management' || val === 'students';
    };

    const mgmtIndex = cloned.findIndex(isStudentMgmtParent);
    if (mgmtIndex !== -1) {
      studentMgmtMenu = cloned[mgmtIndex];
    }

    for (let i = cloned.length - 1; i >= 0; i--) {
      const item = cloned[i];
      if (item === studentMgmtMenu) continue;

      if (isOffer(item)) {
        specialOfferMenu = item;
        cloned.splice(i, 1);
      } else if (isAddStudent(item)) {
        addStudentMenu = item;
        cloned.splice(i, 1);
      } else if (isViewStudent(item)) {
        viewStudentMenu = item;
        cloned.splice(i, 1);
      } else if (item.childList && item.childList.length > 0) {
        for (let j = item.childList.length - 1; j >= 0; j--) {
          const child = item.childList[j];
          if (isOffer(child)) {
            specialOfferMenu = child;
            item.childList.splice(j, 1);
          } else if (isAddStudent(child)) {
            addStudentMenu = child;
            item.childList.splice(j, 1);
          } else if (isViewStudent(child)) {
            viewStudentMenu = child;
            item.childList.splice(j, 1);
          }
        }
      }
    }

    if (studentMgmtMenu && studentMgmtMenu.childList) {
      studentMgmtMenu.childList.forEach((child: any) => {
        if (isOffer(child)) specialOfferMenu = child;
        if (isAddStudent(child)) addStudentMenu = child;
        if (isViewStudent(child)) viewStudentMenu = child;
      });
    }

    const viewStudentChild = viewStudentMenu || {
      id: 9801,
      value: 'Students',
      icon: 'feather-users',
      Icon: 'feather-users',
      menuUrl: '/view-student',
      MenuUrl: '/view-student',
      childList: []
    };
    viewStudentChild.value = 'Students';
    viewStudentChild.menuUrl = '/view-student';
    viewStudentChild.MenuUrl = '/view-student';

    const addStudentChild = addStudentMenu || {
      id: 9802,
      value: 'Add Student',
      icon: 'feather-user-plus',
      Icon: 'feather-user-plus',
      menuUrl: '/student-enrollment',
      MenuUrl: '/student-enrollment',
      childList: []
    };
    addStudentChild.value = 'Add Student';
    addStudentChild.menuUrl = '/student-enrollment';
    addStudentChild.MenuUrl = '/student-enrollment';

    const offerLabel = this.isExternalBilling ? 'Enrollment Invites' : 'Special Offers';
    const offerChild = specialOfferMenu || {
      id: 9803,
      value: offerLabel,
      icon: 'feather-gift',
      Icon: 'feather-gift',
      menuUrl: '/special-offer',
      MenuUrl: '/special-offer',
      childList: []
    };
    offerChild.value = offerLabel;
    offerChild.menuUrl = '/special-offer';
    offerChild.MenuUrl = '/special-offer';

    const childList = [viewStudentChild, addStudentChild, offerChild];

    if (studentMgmtMenu) {
      studentMgmtMenu.value = 'Student Management';
      studentMgmtMenu.menuUrl = null;
      studentMgmtMenu.MenuUrl = null;
      studentMgmtMenu.icon = studentMgmtMenu.icon || 'feather-users';
      studentMgmtMenu.Icon = studentMgmtMenu.Icon || 'feather-users';
      studentMgmtMenu.childList = childList;
    } else {
      studentMgmtMenu = {
        id: 9800,
        value: 'Student Management',
        icon: 'feather-users',
        Icon: 'feather-users',
        menuUrl: null,
        MenuUrl: null,
        childList: childList,
        isOpen: false
      };
      const classIndex = cloned.findIndex((m: any) => {
        const val = (m.value || '').toLowerCase();
        return val.includes('classroom') || val.includes('staff');
      });
      if (classIndex !== -1) {
        cloned.splice(classIndex, 0, studentMgmtMenu);
      } else {
        cloned.splice(1, 0, studentMgmtMenu);
      }
    }

    return cloned;
  }

  applyMenuFilter() {
    if (!this.rawMenus || this.rawMenus.length === 0) return;
    let processed = JSON.parse(JSON.stringify(this.rawMenus));
    if (this.UserRoleId == 3 || this.UserRoleId == 1 || this.UserRoleId == 2) {
      processed = this.organizeStudentManagementMenu(processed);
    }
    if (this.isExternalBilling) {
      this.menus = this.filterExternalBillingMenus(processed);
    } else {
      this.menus = processed;
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

      // Filter student fees, fee packages/plans, invoices/payments, and individual student addition
      if (val === 'student fees' || url === 'student-fees') return true;
      if (url === 'subscription-plans' || url === 'subscription-features') return true;
      if (url.includes('invoice') || val.includes('invoice')) return true;
      if (url.includes('payment') || val.includes('payment')) return true;
      if (url === 'billing-report') return true;
      // keep student enrollment accessible under student management

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
          if (val === 'special offers' || url === 'special-offer' || val.includes('special offer') || url.includes('special-offer') || val === 'offers' || val === 'enrollment invites') {
            copy.value = 'Enrollment Invites';
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



