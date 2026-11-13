import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';
import { DaycareManualAppointmentComponent } from '../../bloomvie-management/dc-appointments-list/daycare-manual-appointment/daycare-manual-appointment.component';

@Component({
  selector: 'app-add-daycare',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbComponent,
    DaycareManualAppointmentComponent
  ],
  templateUrl: './add-daycare.component.html',
  styleUrl: './add-daycare.component.css'
})
export class AddDaycareComponent {

}
