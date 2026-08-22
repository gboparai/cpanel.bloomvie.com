import { Component } from '@angular/core';
import { JobPortalServiceService } from './job-portal-service.service';
import { CookieService } from 'ngx-cookie-service';
import { CommonModule, NgFor } from '@angular/common';
import { EventEmitter, Output } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';
import {
  RouterLink,
  RouterModule,
  RouterOutlet,
  Router,
} from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment.development';
import { NgxSpinnerService } from 'ngx-spinner';
import { SkeletonLoaderComponent } from "../../common-component/skeleton-loader/skeleton-loader.component";
declare var $: any;
@Component({
  selector: 'app-job-portal-details',
  standalone: true,
  imports: [
    NgFor,
    CommonModule,
    NgxPaginationModule,
    BreadcrumbComponent,
    RouterOutlet,
    RouterLink,
    RouterModule,
    SkeletonLoaderComponent
],
  templateUrl: './job-portal-details.component.html',
  styleUrl: './job-portal-details.component.css',
})
export class JobPortalDetailsComponent {
  Jobs: any = [];
  dayCare: number = 0;
  isEditMode: boolean = false;
  @Output() reUseJob = new EventEmitter<any>();
  @Output() editJob = new EventEmitter<any>();
  expandedJobDescriptionIndex: number | null = null;
  ContentP: number = 1;
  Contentsize: number = 5;
  centreID: any;
    skeletonShow = 'Skelton';


  constructor(
    private jobPostingDetailService: JobPortalServiceService,
    private toastr: ToastrService,
    private cookie: CookieService,
    private router: Router,
    private spinner: NgxSpinnerService
  ) { }
  async ngOnInit() {
    const UserInfo = this.cookie.get('UserInfo');
    const parsedInfo = JSON.parse(UserInfo);
    this.centreID = parsedInfo.result.centreID;
    this.dayCare = this.centreID;

    if (this.dayCare > 0) {
      await this.getAllJobPostings('active');
    }
  }

  async getAllJobPostings(Status: any) {
    
    try {

        this.skeletonShow = 'Skelton';

      const data = await this.jobPostingDetailService
        .getAllJobPostings(this.dayCare, Status)
        .toPromise();
      

      if (data.message === 'OK') {
        this.spinner.hide();
        this.Jobs = data.result;
        this.skeletonShow = '';
      } else {
        this.skeletonShow = '';

      }
    } catch (error) {
        this.skeletonShow = '';

      console.error('Error while fetching job postings:', error);
    }
  }

  isDeadLineExpired(applicationDeadLine: any) {
    if (!applicationDeadLine) return false;

    const deadline = new Date(applicationDeadLine);
    const today = new Date();
    return deadline < today;
  }

  reUseJobPost(job: any) {
    
    this.reUseJob.emit(job);
  }

  onEdit(job: any) {
    
    this.editJob.emit(job);
  }

  onPageChange(page: number): void {
    this.ContentP = page;
  }

  activeInActiveByID(id: number, isActive: boolean) {
    
    const action = isActive ? 'deactivate' : 'activate';
    const confirmText = `Are you sure you want to ${action} this job?`;

    Swal.fire({
      title: 'Confirmation',
      text: confirmText,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#297084',
      cancelButtonColor: '#686767',
      confirmButtonText: 'Confirm',
    }).then((result) => {
      if (result.isConfirmed) {
        this.jobPostingDetailService.activeInActiveByID(id, isActive).subscribe(
          (response) => {
            if (response.message === 'Success') {
              // this.toastr.success(response.result);
              if (response.activity != null) {
                this.toastr.success(response.result);
              }
              this.getAllJobPostings('active');
            } else {
              // this.toastr.error(response.message);
            }
          },
          () => {
            // this.toastr.error('There was an issue updating the job status. Please try again.');
          }
        );
      } else {
        setTimeout(() => $(`#checkBoxAinA${id}`).prop('checked', isActive), 0);
      }
    });
  }

  onViewApplication(job: any) {
    
    this.router.navigate(['/jobs-applied'], {
      queryParams: { jobId: job },
    });
  }
}
