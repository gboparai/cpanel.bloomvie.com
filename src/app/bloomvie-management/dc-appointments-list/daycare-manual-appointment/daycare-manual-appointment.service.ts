import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../models/api.types';

@Injectable({
  providedIn: 'root',
})
export class DaycareManualAppointmentService {
  private readonly rootURL: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllCentreTypes(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootURL + '/Common/getAllCentreTypes');
  }

  manageForDayCareInterestedUsers(obj: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      this.rootURL + '/SlotTimeTable/manageForDayCareInterestedUsers',
      obj
    );
  }

  getAvailableSlots(
    counsellorId: any,
    date: any,
    regionHours: number,
    regionMinutes: number
  ): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootURL + '/SlotTimeTable/getAvailableSlots', {
      params: { counsellorId, date, regionHours, regionMinutes },
    });
  }
}
