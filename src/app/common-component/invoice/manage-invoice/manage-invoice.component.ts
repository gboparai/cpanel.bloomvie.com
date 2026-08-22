import { Component } from '@angular/core';
import { BreadcrumbComponent } from '../../breadcrumb/breadcrumb.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-manage-invoice',
  standalone: true,
  imports: [BreadcrumbComponent, RouterLink],
  templateUrl: './manage-invoice.component.html',
  styleUrl: './manage-invoice.component.css'
})
export class ManageInvoiceComponent {

}
