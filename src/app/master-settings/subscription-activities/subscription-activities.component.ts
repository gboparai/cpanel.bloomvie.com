import { Component } from '@angular/core';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-activities',
  standalone: true,
  imports: [
    BreadcrumbComponent
  ],
  templateUrl: './subscription-activities.component.html',
  styleUrl: './subscription-activities.component.css'
})
export class SubscriptionActivitiesComponent {

}
