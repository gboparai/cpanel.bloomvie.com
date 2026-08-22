import { Component } from '@angular/core';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';
import { ManageTeacherComponent } from '../manage-teacher/manage-teacher.component';

@Component({
  selector: 'app-add-teacher',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    ManageTeacherComponent
  ],
  templateUrl: './add-teacher.component.html',
  styleUrl: './add-teacher.component.css'
})
export class AddTeacherComponent {

}
