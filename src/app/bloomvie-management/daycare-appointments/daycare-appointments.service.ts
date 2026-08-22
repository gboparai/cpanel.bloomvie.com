import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DaycareAppointmentsService {
  private readonly rootURL: string = environment.apiUrl;
  constructor(private http: HttpClient) {}

  manageSlots(obj: any): Observable<any> {
    return this.http.post<any>(
      this.rootURL + '/SlotTimeTable/manageSlotsBySlotDuration',
      obj
    );
  }

  getSlotTime(
    slotDate: any,
    regionHours: number,
    regionMinutes: number
  ): Observable<any> {
    return this.http.get(this.rootURL + '/SlotTimeTable/getSlotDate', {
      params: { slotDate, regionHours, regionMinutes },
    });
  }
}
