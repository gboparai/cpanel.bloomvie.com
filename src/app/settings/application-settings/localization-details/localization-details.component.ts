import { Component } from '@angular/core';
import { BreadcrumbComponent } from '../../../common-component/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-localization-details',
  standalone: true,
  imports: [
    BreadcrumbComponent
  ],
  templateUrl: './localization-details.component.html',
  styleUrl: './localization-details.component.css'
})
export class LocalizationDetailsComponent {

}
