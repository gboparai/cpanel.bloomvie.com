import { Component } from '@angular/core';
import { BreadcrumbComponent } from '../../breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-billing-report',
  standalone: true,
  imports: [BreadcrumbComponent],
  templateUrl: './billing-report.component.html',
  styleUrl: './billing-report.component.css'
})
export class BillingReportComponent {

}
