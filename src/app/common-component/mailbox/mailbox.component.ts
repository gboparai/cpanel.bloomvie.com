import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-mailbox',
  standalone: true,
  imports: [
    RouterLink,
    BreadcrumbComponent
  ],
  templateUrl: './mailbox.component.html',
  styleUrl: './mailbox.component.css'
})
export class MailboxComponent {

}
