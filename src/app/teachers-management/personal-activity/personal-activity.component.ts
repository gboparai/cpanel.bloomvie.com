import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-personal-activity',
  standalone: true,
 imports: [RouterOutlet, RouterLink, BreadcrumbComponent
  ],
  templateUrl: './personal-activity.component.html',
  styleUrl: './personal-activity.component.css'
})
export class PersonalActivityComponent {

}
