import { CommonModule } from '@angular/common';
import {  Component } from '@angular/core';
import {ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink, RouterModule, RouterOutlet,Router } from '@angular/router';
import { TocRegistrationService } from '../toc-registration/toc-registration.service';
import { CookieService } from 'ngx-cookie-service';
declare var $: any;
@Component({
  selector: 'app-toc-dashboard',
  imports: [RouterLink,
    RouterOutlet,
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  standalone: true,
  templateUrl: './toc-dashboard.component.html',
  styleUrl: './toc-dashboard.component.css'
})
export class TocDashboardComponent {
  CheckTOCUserDetail: any;
  UserID: number | undefined;
  constructor(private route: ActivatedRoute,
     private router: Router,private tocservice : TocRegistrationService,private cookie: CookieService) {
  }

  ngOnInit(): void {
    this.UserID = parseInt(this.cookie.get('UserId'), 10);
    this.getTOCUserDetailByEmail(this.UserID);
  }

  Redirection(){
    this.router.navigate(['/TOC-registration']);
    this.tocservice.triggerSidebarRefresh();
    this.cookie.set('Component', 'Complete Profile');
    $('#AvailabilityModal').modal('hide');
  }

  CloseModal(){
    $('#AvailabilityModal').modal('hide');
  }

  getTOCUserDetailByEmail(userid:any) {
    this.tocservice.getTOCUserDetailByID(userid,0).subscribe(
      (data) => {
        if (data.message === "ok") {
          this.CheckTOCUserDetail = data.result;
          if(this.CheckTOCUserDetail.partTimeStartDate!=null){
            $('#AvailabilityModal').modal('hide');
          }
          else{
            $('#AvailabilityModal').modal('show');
          }
        } else {
          this.CheckTOCUserDetail = [];    
        }
      },
      (error) => {
        console.error('Error occurred while checking email:', error);
      }
    );
  }
}
