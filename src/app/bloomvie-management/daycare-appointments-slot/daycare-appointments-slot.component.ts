import { Component, OnInit } from '@angular/core';
import { DaycareAppointmentsService } from '../daycare-appointments/daycare-appointments.service';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import flatpickr from 'flatpickr';
import { CommonService } from '../../common-component/common.service';
import { TimeFormatAmPmPipe } from '../dc-appointments-list/time-format.pipe';
@Component({
  selector: 'app-daycare-appointments-slot',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TimeFormatAmPmPipe],
  templateUrl: './daycare-appointments-slot.component.html',
  styleUrls: ['./daycare-appointments-slot.component.css'],
})
export class DaycareAppointmentsSlotComponent implements OnInit {
  slotDate: any;
  dateForm: any;
  selectedDate: any;
  Date: any;

  constructor(
    private service: DaycareAppointmentsService,
    private commonservice: CommonService
  ) { }

  ngOnInit(): void { }

  ngAfterViewInit() {
    this.selectedDate = flatpickr('#datePicker', {
      dateFormat: 'm-d-Y',
      allowInput: true,
    });
  }

  onDateChange(event: any): void {
    this.selectedDate = event.target.value;
    this.getSlotDate(this.selectedDate);
  }

  getSlotDate(selectedDate: string) {

    let region = this.commonservice.regionResponseSignal();

    this.service
      .getSlotTime(selectedDate, region.offsetHours, region.offsetMinutes)
      .subscribe((data) => {
        this.slotDate = data.result;
        if (this.slotDate != null) {
          this.Date = this.slotDate[0].slotDate;
          // this.commonservice.getUtcTime(this.Date);
        }
      });
  }
}
