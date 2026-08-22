import { Component } from '@angular/core';
import { ViewStudentComponent } from '../view-student/view-student.component';
import { ManageStudentComponent } from '../manage-student/manage-student.component';


@Component({
  selector: 'app-add-student',
  standalone: true,
  imports: [
    ViewStudentComponent,
    ManageStudentComponent
  ],
  templateUrl: './add-student.component.html',
  styleUrl: './add-student.component.css'
})
export class AddStudentComponent {

}
