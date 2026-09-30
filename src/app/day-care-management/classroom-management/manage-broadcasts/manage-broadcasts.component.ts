import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-manage-broadcasts',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxPaginationModule],
  templateUrl: './manage-broadcasts.component.html',
  styleUrls: ['./manage-broadcasts.component.css']
})
export class ManageBroadcastsComponent implements OnInit {
  broadcastHistory: any[] = [];
  classList: any[] = [];
  broadcastForm!: FormGroup;
  showModal = false;
  selectedBroadcast: any = null;
  p: number = 1;
  
  constructor(private http: HttpClient, private fb: FormBuilder, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.broadcastForm = this.fb.group({
      classID: [0, Validators.required],
      sendToParents: [false],
      sendToTeachers: [false],
      subject: ['', Validators.required],
      message: ['', Validators.required]
    });
    
    this.fetchClassDropdown();
    this.fetchHistory();
  }

  fetchClassDropdown() {
    this.http.get<any>(`${environment.apiUrl}/Classroom/getDaycareClassListDropdown?id=0`).subscribe(res => {
      if (res && res.success) {
        this.classList = res.result || [];
      }
    });
  }

  fetchHistory() {
    this.http.get<any>(`${environment.apiUrl}/Classroom/GetBroadcastHistory`).subscribe(res => {
      if (res && res.success) {
        this.broadcastHistory = res.result || [];
      }
    });
  }

  openNewBroadcastModal() {
    this.broadcastForm.reset({ classID: 0, sendToParents: false, sendToTeachers: false, subject: '', message: '' });
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedBroadcast = null;
  }
  
  viewDetails(item: any) {
    this.selectedBroadcast = item;
    this.showModal = true;
  }

  submitBroadcast() {
    if (this.broadcastForm.invalid) {
      this.toastr.warning('Please fill all required fields.');
      return;
    }
    
    const val = this.broadcastForm.value;
    if (!val.sendToParents && !val.sendToTeachers) {
      this.toastr.warning('Please select at least one target audience (Parents or Teachers).');
      return;
    }
    
    this.http.post<any>(`${environment.apiUrl}/Classroom/BroadcastEmail`, val).subscribe(res => {
      if (res && res.success) {
        this.toastr.success(res.message);
        this.closeModal();
        this.fetchHistory();
      } else {
        this.toastr.error(res?.message || 'Error queueing broadcast.');
      }
    });
  }
}
