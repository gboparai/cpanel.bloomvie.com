import { Component } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { ProfileComponent } from '../../../common-component/profile/profile.component';
import { BreadcrumbComponent } from '../../../common-component/breadcrumb/breadcrumb.component';
import { ChildReportComponent } from '../../../common-component/report/child-report/child-report.component';
import { StudentProfileComponent } from '../../student-management/student-profile/student-profile.component';
import { StudentAdditionalInformationComponent } from '../../student-management/student-profile/student-additional-information/student-additional-information.component';


@Component({
  selector: 'app-class-activity',
  standalone: true,
  imports: [ProfileComponent,BreadcrumbComponent,ChildReportComponent,RouterLink,RouterModule,StudentProfileComponent,StudentAdditionalInformationComponent],
  templateUrl: './view-student-detail.component.html',
  styleUrl: './view-student-detail.component.css'
})
export class ViewStudentDetailComponent {


  

}
