import { Component } from '@angular/core';
import { BreadcrumbComponent } from '../../../common-component/breadcrumb/breadcrumb.component';
import { ViewActivityComponent } from '../view-activity/view-activity.component';

@Component({
  selector: 'app-manage-activity',
  standalone: true,
  imports: [BreadcrumbComponent,ViewActivityComponent],
  templateUrl: './manage-activity.component.html',
  styleUrl: './manage-activity.component.css'
})
export class ManageActivityComponent {

}
