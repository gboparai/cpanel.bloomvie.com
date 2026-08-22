import { Component } from '@angular/core';
import { BreadcrumbComponent } from '../../../common-component/breadcrumb/breadcrumb.component';
import { ManageClassroomComponent } from '../manage-classroom/manage-classroom.component';

@Component({
  selector: 'app-add-classroom',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    ManageClassroomComponent
  ],
  templateUrl: './add-classroom.component.html',
  styleUrl: './add-classroom.component.css'
})
export class AddClassroomComponent {

}
