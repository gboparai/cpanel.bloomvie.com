import { Component } from '@angular/core';
import { ManageActivityComponent } from '../manage-activity/manage-activity.component';
import { ViewActivityComponent } from '../view-activity/view-activity.component';
import { BreadcrumbComponent } from '../../../common-component/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-add-activity',
  standalone: true,
  imports: [ManageActivityComponent,ViewActivityComponent,BreadcrumbComponent],
  templateUrl: './add-activity.component.html',
  styleUrl: './add-activity.component.css'
})
export class AddActivityComponent {

}
