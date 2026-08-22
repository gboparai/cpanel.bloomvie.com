import { Component } from '@angular/core';
import { BreadcrumbComponent } from '../../breadcrumb/breadcrumb.component';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-attendance-report',
  standalone: true,
  imports: [BreadcrumbComponent, RouterLink],
  templateUrl: './attendance-report.component.html',
  styleUrl: './attendance-report.component.css'
})
export class AttendanceReportComponent {

}
