import { Component } from '@angular/core';
import { ManageActivityComponent } from '../manage-activity/manage-activity.component';
import { BreadcrumbComponent } from '../../../common-component/breadcrumb/breadcrumb.component';

import { forwardRef } from '@angular/core';

@Component({
  selector: 'app-view-activity',
  standalone: true,
  imports: [forwardRef(() => ManageActivityComponent),
    BreadcrumbComponent

  ],
  templateUrl: './view-activity.component.html',
  styleUrl: './view-activity.component.css'
})
export class ViewActivityComponent {

}
