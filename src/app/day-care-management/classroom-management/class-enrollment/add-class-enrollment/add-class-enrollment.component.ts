import { Component } from '@angular/core';
import { ManageClassEnrollmentComponent } from '../manage-class-enrollment/manage-class-enrollment.component';
import { ViewClassEnrollmentComponent } from '../view-class-enrollment/view-class-enrollment.component';

@Component({
  selector: 'app-add-class-enrollment',
  standalone: true,
  imports: [
    ManageClassEnrollmentComponent,
    ViewClassEnrollmentComponent
  ],
  templateUrl: './add-class-enrollment.component.html',
  styleUrl: './add-class-enrollment.component.css'
})
export class AddClassEnrollmentComponent {

}
