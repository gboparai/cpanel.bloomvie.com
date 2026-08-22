import { Component } from '@angular/core';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';
import { ManageDaycareComponent } from '../manage-daycare/manage-daycare.component';

@Component({
  selector: 'app-add-daycare',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    ManageDaycareComponent
  ],
  templateUrl: './add-daycare.component.html',
  styleUrl: './add-daycare.component.css'
})
export class AddDaycareComponent {

}
