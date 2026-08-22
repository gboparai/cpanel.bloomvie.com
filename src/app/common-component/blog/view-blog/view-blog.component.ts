import { BreadcrumbComponent } from './../../breadcrumb/breadcrumb.component';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-ew-blog',
  standalone: true,
  imports: [RouterLink, BreadcrumbComponent],
  
  templateUrl: './view-blog.component.html',
  styleUrl: './view-blog.component.css'
})
export class ViewBlogComponent {
   
}
