import { Component } from '@angular/core';
import { ManageActivityComponent } from '../manage-activity/manage-activity.component';

@Component({
  selector: 'app-edit-activity',
  standalone: true,
  imports: [ManageActivityComponent],
  templateUrl: './edit-activity.component.html',
  styleUrl: './edit-activity.component.css'
})
export class EditActivityComponent {

}
