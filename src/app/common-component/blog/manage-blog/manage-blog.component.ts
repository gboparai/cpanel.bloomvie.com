import { RouterLink } from '@angular/router';
import { BreadcrumbComponent } from './../../breadcrumb/breadcrumb.component';
import { Component } from '@angular/core';

@Component({
  selector: 'app-manage-blog',
  standalone: true,
  imports: [BreadcrumbComponent, RouterLink],
  templateUrl: './manage-blog.component.html',
  styleUrl: './manage-blog.component.css'
})
export class ManageBlogComponent {

}
