import { Component } from '@angular/core';
import { ManageClassRosterComponent } from '../manage-class-roster/manage-class-roster.component';
import { ViewClassRosterComponent } from '../view-class-roster/view-class-roster.component';

@Component({
  selector: 'app-add-class-roster',
  standalone: true,
  imports: [
    ManageClassRosterComponent,
    ViewClassRosterComponent
  ],
  templateUrl: './add-class-roster.component.html',
  styleUrl: './add-class-roster.component.css'
})
export class AddClassRosterComponent {

}
