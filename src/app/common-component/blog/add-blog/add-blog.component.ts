import { BreadcrumbComponent } from './../../breadcrumb/breadcrumb.component';
import { Component } from '@angular/core';

@Component({
  selector: 'app-add-blog',
  standalone: true,
  imports: [BreadcrumbComponent],
  templateUrl: './add-blog.component.html',
  styleUrl: './add-blog.component.css'
})
export class AddBlogComponent {

}
