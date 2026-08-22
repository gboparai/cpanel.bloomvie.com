import { AppService } from './../../../app.service';
import { Component, EventEmitter, Input, input, Output, SimpleChanges } from '@angular/core';
import { SmtpService } from '../smtp.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { BreadcrumbComponent } from '../../../common-component/breadcrumb/breadcrumb.component';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { SkeletonLoaderComponent } from "../../../common-component/skeleton-loader/skeleton-loader.component";
declare var $: any;

@Component({
  selector: 'app-smtp-list',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule, ToastrModule, BreadcrumbComponent, SkeletonLoaderComponent],
  templateUrl: './smtp-list.component.html',
  styleUrl: './smtp-list.component.css'
})
export class SmtpListComponent {

  smtpList: any[] = [];
  ContentP: number = 1;
  Contentsize: number = 5;
  selectedEditSmtpId: any;
  isActive: boolean = true;
  skeletonShow = 'Skelton';


  @Output() idSelected = new EventEmitter<string>();

  constructor(private smtpService: SmtpService, private toastr: ToastrService, private cookies: CookieService,
    private spinner: NgxSpinnerService
  ) { }

  // onEdit(item:any){
  //   this.

  // }


  ngOnInit() {
    this.GetList();
  }

  GetList() {
    this.skeletonShow = 'Skelton';
    var centreID = parseInt(this.cookies.get('CentreID'));
    if (!centreID) {
      centreID = 0;
    }

    this.smtpService.GetAllSMTPSettings(centreID).subscribe(data => {
      if (data.message === "Success") {
        this.smtpList = data.result
        this.skeletonShow = '';
      }
      else {
        console.warn("NO Data Found!")
        this.skeletonShow = '';

      }
    })
  }

  onEdit(id: any) {
    this.idSelected.emit(id);
  }

  activeInactive(id: any, isActive: boolean) {
    var action = "activated";
    Swal.fire({
      title: 'Confirmation',
      text: isActive ? "Are you sure you want to deactivate the SMTP?" : "Are you sure you want to activate the SMTP?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: '#297084',
      cancelButtonColor: '#686767',
      confirmButtonText: isActive ? "Confirm" : "Confirm"
    }).then(result => {
      if (result.isConfirmed) {
        if (isActive == true) {
          action = "deactivated"
        }
        this.smtpService.ActiveInactiveSMTPSettingbyId(id).subscribe(data => {
          this.toastr.success("SMTP has been " + action + " successfully")
          this.GetList();
        })
      }
      else {
        function check() {
          $("#check" + id).prop("checked", true)
        }
        function uncheck() {
          $("#check" + id).prop("checked", false)
        }
        isActive ? check() : uncheck()
      }

    })
  }

}
