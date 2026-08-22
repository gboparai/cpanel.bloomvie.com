import { ChildRoutineComponent } from './../parent-management/parent-onboarding/child-routine/child-routine.component';
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ChildParentDetailsComponent } from '../parent-management/parent-onboarding/child-parent-details/child-parent-details.component';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [RouterLink, RouterOutlet, ChildParentDetailsComponent,ChildRoutineComponent,],
  templateUrl: './student-detail.component.html',
  styleUrl: './student-detail.component.css'
})
export class StudentDetailComponent {

}
