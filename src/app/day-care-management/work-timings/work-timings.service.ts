import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { url } from 'node:inspector';

@Injectable({
  providedIn: 'root'
})
export class WorkTimingService {
  readonly URL = environment.apiUrl;
  private apiUrl = '/Centre/manageCentreWorkingDays';
  private getDays = '/Centre/getCentreWorkingDaysByCentreID'

  constructor(private http: HttpClient) {}

  saveWorkTimings(data: any): Observable<any> {
    return this.http.post(this.URL + this.apiUrl, data);
  }
  getCentreWorkingDaysByCentreID(centreID: any): Observable<any> {
    return this.http.get(this.URL + this.getDays , {params:{centreID}});
  }
  manageDaycareCentreHoliday(postData: any): Observable<any> {
    return this.http.post<any>(this.URL + "/Centre/manageDaycareCentreHolidays", postData);
  }
  getCentreHolidayList(dayCareID:number):Observable<any>{
    return this.http.get<any>(this.URL+'/Centre/getDaycareCentreHolidayList',{params:{dayCareID}});
  }
  activeInactiveHolidays(dayCareID:number,holidayListID:number[]):Observable<any>{
    return this.http.post<any>(this.URL+'/Centre/activeInactiveHolidays',holidayListID,{params:{dayCareID}});
  }

  manageSeasonalBreaks(postData:any):Observable<any>{
    return this.http.post<any>(this.URL+'/Centre/manageSeasonalHolidays',postData);
  }

  getSeasonalHolidays(dayCareID:number){
    return this.http.get<any>(this.URL+'/Centre/getDaycareSeasonalHolidayList',{params:{dayCareID}});
  }

  activeInactiveSeasonalHoliday(ID:number):Observable<any>{
    return this.http.get<any>(this.URL+'/Centre/activeInactiveSeasonalHoliday',{params:{ID}});
  }

  deleteHoliday(ID: number): Observable<any> {
    return this.http.delete<any>(this.URL + '/Centre/deleteDaycareHoliday', { params: { ID } });
  }
}
