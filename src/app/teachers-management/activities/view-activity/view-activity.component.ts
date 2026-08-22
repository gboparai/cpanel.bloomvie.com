import { Component } from '@angular/core';
import { ManageActivityComponent } from '../manage-activity/manage-activity.component';
import { BreadcrumbComponent } from '../../../common-component/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-view-activity',
  standalone: true,
  imports: [ManageActivityComponent,
    BreadcrumbComponent

  ],
  templateUrl: './view-activity.component.html',
  styleUrl: './view-activity.component.css'
})
export class ViewActivityComponent {

}
