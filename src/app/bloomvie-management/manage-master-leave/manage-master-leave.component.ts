import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Output, Renderer2, ViewChild, viewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ManageMasterLeaveService } from './manage-master-leave.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Toast, ToastNoAnimation, ToastrService } from 'ngx-toastr';
import { elementAt, finalize } from 'rxjs';
import { validateBBox } from '@turf/helpers';
import Swal from 'sweetalert2';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';
import { CommonService } from '../../common-component/common.service';
import { OnboardingService } from '../../onboarding/onboarding.service';
import { CookieService } from 'ngx-cookie-service';
import { SkeletonLoaderComponent } from "../../common-component/skeleton-loader/skeleton-loader.component";

@Component({
  selector: 'app-manage-master-leave',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, RouterOutlet, BreadcrumbComponent, SkeletonLoaderComponent],
  templateUrl: './manage-master-leave.component.html',
  styleUrl: './manage-master-leave.component.css',
  providers: [
    { provide: ToastrService, useClass: ToastrService },
    { provide: ToastNoAnimation, useClass: ToastNoAnimation }
  ]
})
export class ManageMasterLeaveComponent {
  @Output() leaveTypeRefresh = new EventEmitter<void>();
  leaveForm!: FormGroup;
  submitted = false;
  leaveTypeList: { id: number; leaveType: string, isActive: boolean }[] = [];
  daycareCentreId: number = 0;
  loginUserId: number = 0;
isEdit:any;
skeletonShow="Skelton";


  constructor(
    private fb: FormBuilder,
    private leaveTypeService: ManageMasterLeaveService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private renderer2: Renderer2,
    private commonService: CommonService,
    public onBoardingService: OnboardingService,
    private route: ActivatedRoute,
    private cookie: CookieService,

  ) {
    this.leaveForm = this.fb.group({
      id: [0],
      leaveType: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]]
    });
  }

  ngOnInit(): void {
    const enc_id = this.route.snapshot.queryParamMap.get('enc_id');
    if (enc_id) {
      const decryptedId = this.commonService.decrypt(enc_id);
      this.daycareCentreId =
        decryptedId && !isNaN(Number(decryptedId)) ? parseInt(decryptedId, 10) : 0;
    } else if (this.cookie.check('CentreID')) {
      const centreId = parseInt(this.cookie.get('CentreID'));
      if (!isNaN(centreId)) {
        this.daycareCentreId = centreId;
      }
    };

    if (this.cookie.check('UserId')) {
      const UserId = parseInt(this.cookie.get('CentreID'));
      if (!isNaN(UserId)) {
        this.loginUserId = parseInt(this.cookie.get('UserId'));
      }
    }
    this.getLeaveList();
  }

  get isValid(): boolean {
    return this.leaveTypeList.length > 0;
  }

  getLeaveList() {
    // this.spinner.show();
    this.skeletonShow="Skelton";

    const userRoleId = parseInt(this.cookie.get('UserRoleId'), 10);
    const userType = userRoleId === 1 ? 'super-admin' : 'daycare-admin';
    this.leaveTypeService.getLeaveList(this.daycareCentreId, userType).pipe(finalize(() =>     this.skeletonShow="")).subscribe({
      next: (response) => {
        this.leaveTypeList = response.result;
      }, error: (err) => {
        this.toastr.error(err.message);
      }
    })
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.leaveForm.invalid) {
      return;
    }
    this.spinner.show();
    const userRoleId = parseInt(this.cookie.get('UserRoleId'), 10);
    const payload = {
      ...this.leaveForm.value,
      loginUserId: this.loginUserId,
      centreId: userRoleId === 1 ? null : this.daycareCentreId
    };
    this.leaveTypeService.manageLeave(payload).pipe(finalize(() => this.spinner.hide()))
      .subscribe({
        next: (response) => {
          this.toastr.success(response.message);
          this.leaveForm.reset({ id: 0 });
          this.submitted = false;
          this.getLeaveList();
          this.leaveTypeRefresh.emit();
          this.isEdit = null;
        }, error: (err) => {
          this.toastr.error(err.message);
        }
      })
  }

  editLeave(item: { id: number; leaveType: string }) {
    this.isEdit = item.id;
    this.leaveForm.patchValue(item);
  }

reset() {
  this.isEdit = null;
  this.leaveForm.reset(); 
}


  toggleStatus(id: number, isActive: boolean) {
    const action = isActive ? 'Deactivate' : 'Activate';
    Swal.fire({
      title: `${action} Confirmation`,
      text: `Are you sure you want to ${action.toLowerCase()} this item?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, ${action}`,
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.leaveTypeService.activeInactive(id).pipe(finalize(() => this.spinner.hide())).subscribe({
          next: (response) => {
            this.toastr.success(response.message);
            this.getLeaveList();
          }, error: (err) => {
            this.toastr.error(err.message);
          }
        })
      } else {
        const leaveType = this.leaveTypeList.find(x => x.id === id);
        if (leaveType) {
          leaveType.isActive = !leaveType.isActive;
        }
      }
    })
  }
}
