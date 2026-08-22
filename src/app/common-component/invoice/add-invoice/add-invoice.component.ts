import { BreadcrumbComponent } from './../../breadcrumb/breadcrumb.component';
import { Component } from '@angular/core';


@Component({
  selector: 'app-add-invoice',
  standalone: true,
  imports: [BreadcrumbComponent],
  templateUrl: './add-invoice.component.html',
  styleUrl: './add-invoice.component.css'
})
export class AddInvoiceComponent {

}
