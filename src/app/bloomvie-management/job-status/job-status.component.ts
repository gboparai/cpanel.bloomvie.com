import { Component } from '@angular/core';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-job-status',
  standalone: true,
  imports: [
    BreadcrumbComponent
  ],
  templateUrl: './job-status.component.html',
  styleUrl: './job-status.component.css'
})
export class JobStatusComponent {

}
