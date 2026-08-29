import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { __param } from 'tslib';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DaycareManualAppointmentService {
  private readonly rootURL: string = environment.apiUrl;

  constructor(private http: HttpClient) {}
  getAllCentreTypes(): Observable<any> {
    return this.http.get<any>(this.rootURL + '/Common/getAllCentreTypes');
  }

  manageForDayCareInterestedUsers(obj: any): Observable<any> {
    return this.http.post(
      this.rootURL + '/SlotTimeTable/manageForDayCareInterestedUsers',
      obj
    );
  }

  getAvailableSlots(
    counsellorId: any,
    date: any,
    regionHours: number,
    regionMinutes: number
  ): Observable<any> {
    return this.http.get(this.rootURL + '/SlotTimeTable/getAvailableSlots', {
      params: { counsellorId, date, regionHours, regionMinutes },
    });
  }
  // GetslotById(id:any):Observable<any>
  // {
  //   return this.http.get(this.rootURL+ "/SlotTimeTable/getSlotById",{params:{id}})
  // }
}
