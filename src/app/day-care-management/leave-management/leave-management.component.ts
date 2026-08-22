import { Component, computed, OnInit, Renderer2, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';
import { ManageMasterLeaveService } from '../../bloomvie-management/manage-master-leave/manage-master-leave.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { CookieService } from 'ngx-cookie-service';
import Swal from 'sweetalert2';
import { OnboardingService } from '../../onboarding/onboarding.service';
import { CommonService } from '../../common-component/common.service';
import { ManageMasterLeaveComponent } from '../../bloomvie-management/manage-master-leave/manage-master-leave.component';
import { SkeletonLoaderComponent } from "../../common-component/skeleton-loader/skeleton-loader.component";
import { NgxPaginationModule } from 'ngx-pagination';
// import { TextCounterComponent } from '../../common-component/text-counter/text-counter.component';

@Component({
  selector: 'app-leave-management',
  standalone: true,
  imports: [
    RouterLink,
    ManageMasterLeaveComponent,
    RouterOutlet,
    BreadcrumbComponent,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NgxPaginationModule,
    NgSelectModule,
    SkeletonLoaderComponent
  ],
  templateUrl: './leave-management.component.html',
  styleUrl: './leave-management.component.css'
})
export class LeaveManagementComponent implements OnInit {
  daycareLeaveForm!: FormGroup;
  submitted: boolean = false;
  daycareCentreId: number = 0;
  isEditing: boolean = false;
  leaveTypeList: { id: number, leaveType: string }[] = [];
  assignedLeaveList: {
    id: number, daycareCentreId: number, leaveTypeId: number,
    leaveType: string, leaveCount: number, isActive: boolean,
    description: string
  }[] = [];
  expandedDescriptionIndex: number | null = null;

  skeletonShow = "Skelton"

  currentPage: number = 1;
  itemsPerPage: number = 5;

  public groupControl: FormControl = new FormControl('')
  totalCount: number = 0;


  constructor(private leaveTypeService: ManageMasterLeaveService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private cookie: CookieService,
    private renderer2: Renderer2,
    public onBoardingService: OnboardingService,
    private commonService: CommonService,
    private route: ActivatedRoute

  ) {
    this.daycareLeaveForm = fb.group({
      id: [0],
      // leaveTypeId: [null, [Validators.required]],
      leaveType: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      leaveCount: [null, [Validators.required, Validators.min(1), Validators.max(20)]],
    })

  }

  ngOnInit(): void {
    const enc_id = this.route.snapshot.queryParamMap.get('enc_id');
    if (enc_id) {
      const decryptedId = this.commonService.decrypt(enc_id);
      this.daycareCentreId =
        decryptedId && !isNaN(Number(decryptedId)) ? parseInt(decryptedId, 10) : 0;
    } else if (this.cookie.check('CentreID')) {
      const centreIdStr = parseInt(this.cookie.get('CentreID'));
      const centreId = Number(centreIdStr);
      if (!isNaN(centreId)) {
        this.daycareCentreId = centreId;
      }
    };
    this.getAssignedLeavesByDaycareId();
    this.getLeaveTypeList();
  }

  onEdit(item: any) {
    this.isEditing = true;
    this.daycareLeaveForm.patchValue({
      id: item.id,
      leaveType: item.leaveType,
      description: item.description,
      leaveCount: item.leaveCount
    });

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
        this.leaveTypeService.activeInactiveDaycareLeaveAssignment(id).pipe(finalize(() => this.spinner.hide())).subscribe({
          next: (response) => {
            this.toastr.success(response.message);
            this.getAssignedLeavesByDaycareId();
          },
          error: (err) => {
            this.toastr.error(err.message);
          }
        })

      } else {
        const leave = this.assignedLeaveList.find(x => x.id === id);
        if (leave) {
          leave.isActive = !leave.isActive;
        }
      }
    })
  }

  getAssignedLeavesByDaycareId() {
    this.skeletonShow = "Skelton"
    this.leaveTypeService.getAssignedLeavesByDaycareId(this.daycareCentreId).pipe(finalize(() => this.skeletonShow = '')).subscribe({
      next: (response) => {
        this.assignedLeaveList = response.result;

        this.totalCount = this.assignedLeaveList.length || 0;
      }, error: (err) => {
        this.toastr.error(err.message);
      }
    })
  }

  getLeaveTypeList() {
    const userRoleId = parseInt(this.cookie.get('UserRoleId'), 10);
    const userType = userRoleId === 1 ? 'super-admin' : 'daycare-admin';
    this.leaveTypeService.getLeaveList(this.daycareCentreId, userType).subscribe({
      next: (response) => {
        this.leaveTypeList = response.result.filter((x: { isActive: boolean }) => x.isActive);
      }, error: (err) => {
        this.toastr.error(err.message);
      }
    })
  }

  getLocalIso(): string {
    const date = new Date();
    const off = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - off * 60000);
    return localDate.toISOString().slice(0, 19);  // removes Z but keeps T
  }

  onSubmit() {
    this.submitted = true;
    if (this.daycareLeaveForm.invalid) {
      this.submitted = false;
      this.daycareLeaveForm.markAllAsTouched();
      return;
    }
    this.spinner.show();

    const createdDate = this.getLocalIso(); // frontend local time
    const payload = {
      ...this.daycareLeaveForm.value,
      daycareCentreId: this.daycareCentreId,
      createdDate: this.daycareLeaveForm.value.id ? null : createdDate,
      updatedDate: createdDate,
    };
    // const payload = { ...this.daycareLeaveForm.value, daycareCentreId: this.daycareCentreId };
    this.leaveTypeService.upsertDaycareLeave(payload).pipe(finalize(() => { this.spinner.hide(), this.submitted = false })).subscribe({
      next: (response) => {
        this.toastr.success(response.message);
        this.isEditing = false;
        this.daycareLeaveForm.reset({ id: 0 });
        this.getAssignedLeavesByDaycareId();
      },
      error: (err) => {
        this.toastr.error(err.message);
      }
    })
  }


  reset() {
    this.isEditing = false;
  }

  get isValid(): boolean {
    return this.assignedLeaveList.length > 0;
  }

  proceedToOnboarding() {
    this.commonService.manageDaycareOnBoarding(this.daycareCentreId, 'ManageDaycareLeaveAssignment')
      .subscribe((result: any) => {
        if (result.message == 'Success') {
          if (!this.onBoardingService.onBoardingData.isCompleteStep8) {
            this.onBoardingService.onBoardingData.isCompleteStep8 = true;
            this.onBoardingService.handleNext('Tab-8');
          } else {
            this.onBoardingService.getCurrentTab();
          }
        }
      });
  }
}
