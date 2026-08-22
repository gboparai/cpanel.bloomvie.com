import { Component } from '@angular/core';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-master-features',
  standalone: true,
  imports: [
    BreadcrumbComponent
  ],
  templateUrl: './master-features.component.html',
  styleUrl: './master-features.component.css'
})
export class MasterFeaturesComponent {

}
