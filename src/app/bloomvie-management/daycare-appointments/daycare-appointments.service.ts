import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api.types';

@Injectable({
  providedIn: 'root',
})
export class DaycareAppointmentsService {
  private readonly rootURL: string = environment.apiUrl;
  constructor(private http: HttpClient) {}

  manageSlots(obj: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      this.rootURL + '/SlotTimeTable/manageSlotsBySlotDuration',
      obj
    );
  }

  getSlotTime(
    slotDate: any,
    regionHours: number,
    regionMinutes: number
  ): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootURL + '/SlotTimeTable/getSlotDate', {
      params: { slotDate, regionHours, regionMinutes },
    });
  }
}
