import { Component } from '@angular/core';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-manage-expense',
  standalone: true,
  imports: [BreadcrumbComponent],
  templateUrl: './manage-expense.component.html',
  styleUrl: './manage-expense.component.css'
})
export class ManageExpenseComponent {

}
