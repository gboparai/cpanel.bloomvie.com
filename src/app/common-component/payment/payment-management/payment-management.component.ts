import { Component } from '@angular/core';
import { BreadcrumbComponent } from "../../breadcrumb/breadcrumb.component";

@Component({
  selector: 'app-payment-management',
  standalone: true,
  imports: [BreadcrumbComponent],
  templateUrl: './payment-management.component.html',
  styleUrl: './payment-management.component.css'
})
export class PaymentManagementComponent {

}
