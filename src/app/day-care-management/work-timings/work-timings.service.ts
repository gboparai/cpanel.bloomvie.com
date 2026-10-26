import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, DaycareHolidayItem } from '../../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class WorkTimingService {
  readonly URL = environment.apiUrl;
  private apiUrl = '/Centre/manageCentreWorkingDays';
  private getDays = '/Centre/getCentreWorkingDaysByCentreID';

  constructor(private http: HttpClient) {}

  saveWorkTimings(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.URL + this.apiUrl, data);
  }
  getCentreWorkingDaysByCentreID(centreID: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + this.getDays, { params: { centreID } });
  }
  manageDaycareCentreHoliday(postData: DaycareHolidayItem | any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.URL + "/Centre/manageDaycareCentreHolidays", postData);
  }
  getCentreHolidayList(dayCareID: number): Observable<ApiResponse<DaycareHolidayItem[]>> {
    return this.http.get<ApiResponse<DaycareHolidayItem[]>>(this.URL + '/Centre/getDaycareCentreHolidayList', { params: { dayCareID } });
  }
  activeInactiveHolidays(dayCareID: number, holidayListID: number[]): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.URL + '/Centre/activeInactiveHolidays', holidayListID, { params: { dayCareID } });
  }

  manageSeasonalBreaks(postData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.URL + '/Centre/manageSeasonalHolidays', postData);
  }

  getSeasonalHolidays(dayCareID: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + '/Centre/getDaycareSeasonalHolidayList', { params: { dayCareID } });
  }

  activeInactiveSeasonalHoliday(ID: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + '/Centre/activeInactiveSeasonalHoliday', { params: { ID } });
  }

  deleteHoliday(ID: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(this.URL + '/Centre/deleteDaycareHoliday', { params: { ID } });
  }
}
