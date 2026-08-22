import { Component } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { ReactiveFormsModule, Validators, FormBuilder, FormsModule, NgForm } from '@angular/forms';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { SwitcherComponentComponent } from '../../common-component/switcher-component/switcher-component.component';
import { TeacherAreaOfExpertiseService } from '../../settings/teacher-area-of-expertise/teacher-area-of-expertise.service';
import { CommonService } from '../../common-component/common.service';
import { CookieService } from 'ngx-cookie-service';
import { ThemeService } from 'ng2-charts';
import { finalize } from 'rxjs';

interface ApiResponse {
  message: string | null;
  activity: string | undefined;
  result: any | null;
}

@Component({
  selector: 'app-bloomvie-settings',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    SwitcherComponentComponent,
    ReactiveFormsModule,
    NgxPaginationModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './bloomvie-settings.component.html',
  styleUrl: './bloomvie-settings.component.css'
})
export class BloomvieSettingsComponent {
  platformFee: number | null = null;

  public bloomviesettingsform: any;
  public expertise: any[] = [];
  public ContentP: number = 1;
  public Contentsize: number = 5;
  public isEditMode: boolean = false;
  userRoleID: any;
  bloomvieSettings: any = null;
  ownerID: any;
  public bloomvieradiussettingsform: any;
  ownerEmail: string | undefined

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private commonService: CommonService,
    private cookies: CookieService
  ) {
    this.bloomviesettingsform = this.fb.group({
      id: [0],
      studentMediaDownload: ['', [Validators.required]],
      costPerGB: ['', [Validators.required]],
      ownerID: [0],
      userRoleID: [0],
      isActive: [true],
    });

    this.bloomvieradiussettingsform = this.fb.group({
      id: [0],
      ownerID: [0],
      userRoleID: [0],
      isActive: [true],
      radius: ['', Validators.required],
      email: ['']

    });
  }

  ngOnInit() {
    this.userRoleID = this.cookies.get('UserRoleId')
    this.ownerID = this.cookies.get('UserId')
    // this.ownerEmail = this.cookies.get('email')


    this.getBloomvieSettings();

  }

  reset() {
    this.bloomviesettingsform.patchValue({
      studentMediaDownload: ['', [Validators.required]],
      costPerGB: ['', [Validators.required]],
      radius: ['', Validators.required],
      isActive: [true]
    });
  }

  // onEdit(item: any) {
  //   this.isEditMode = true;
  //   this.bloomviesettingsform.patchValue({
  //     id: item.id,
  //     studentMediaDownload: item.studentMediaDownload,
  //     costPerGB: item.costPerGB,
  //     isActive: item.isActive
  //   });
  // }

  getBloomvieSettings() {
    this.spinner.show();

    this.commonService.getBloomvieSettings(1).subscribe((response: ApiResponse) => {
      if (response.message == 'Success') {
        this.bloomvieSettings = response.result;
        this.bloomviesettingsform.patchValue({
          studentMediaDownload: this.bloomvieSettings.studentMediaDownload,
          costPerGB: this.bloomvieSettings.costPerGB,
        });
        this.bloomvieradiussettingsform.patchValue({
          radius: this.bloomvieSettings.radius,
          email: this.bloomvieSettings.email
        });
        this.platformFee = response?.result?.platformFeePercentage;
        this.spinner.hide();

      }
      this.spinner.hide();

    });
  }

  submitPlatFormFee(form: NgForm) {
    if (form.valid) {
      const baseData = this.bloomvieSettings
        ? { ...this.bloomvieSettings }
        : { ...this.bloomviesettingsform.value };

      const payload = {
        ...baseData,
        platFormFee: this.platformFee,
        ownerID: parseInt(this.ownerID),
        userRoleID: parseInt(this.userRoleID)
      };
      this.spinner.show();
      this.commonService.manageBloomvieSettings(payload).pipe(finalize(() => this.spinner.hide())).subscribe((response: ApiResponse) => {
        if (response.message === 'OK') {
          this.getBloomvieSettings();
          this.toastr.success(response.activity);
        } else {
          this.toastr.warning(response.activity);
        }
      });
    } else {
      Object.values(form.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }

  manageAreaOfExpertise() {
    if (this.bloomviesettingsform.valid) {
      this.spinner.show();

      this.bloomviesettingsform.patchValue({
        ownerID: parseInt(this.ownerID),
        userRoleID: parseInt(this.userRoleID),
      });

      const payload = { ...this.bloomviesettingsform.value, platFormFee: this.bloomvieSettings.platformFeePercentage || 0, }

      this.commonService.manageBloomvieSettings(payload)
        .subscribe((response: ApiResponse) => {
          if (response.message == 'OK') {
            // this.getAllAreaOfExpertise();
            this.spinner.hide();
            this.getBloomvieSettings()
            this.toastr.success(response.activity);
          } else {
            this.spinner.hide();
            this.toastr.warning(response.activity);
          }
        });
    } else {
      this.bloomviesettingsform.markAllAsTouched();
    }
  }

  manageBloomvieRadiusSettings() {
    if (this.bloomvieradiussettingsform.valid) {
      this.spinner.show();

      this.bloomvieradiussettingsform.patchValue({
        ownerID: parseInt(this.ownerID),
        userRoleID: parseInt(this.userRoleID),

      });

      this.commonService.manageBloomvieRadiusSettings(this.bloomvieradiussettingsform.value)
        .subscribe((response: ApiResponse) => {
          if (response.message == 'OK') {
            this.spinner.hide();
            this.getBloomvieSettings()
            this.toastr.success(response.activity);
          } else {
            this.spinner.hide();
            this.toastr.warning(response.activity);
          }
        });
    } else {
      this.bloomvieradiussettingsform.markAllAsTouched();
    }
  }


}

