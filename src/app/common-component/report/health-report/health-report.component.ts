import { Component } from '@angular/core';
import { BreadcrumbComponent } from '../../breadcrumb/breadcrumb.component';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-health-report',
  standalone: true,
  imports: [BreadcrumbComponent, RouterLink],
  templateUrl: './health-report.component.html',
  styleUrl: './health-report.component.css'
})
export class HealthReportComponent {

}
