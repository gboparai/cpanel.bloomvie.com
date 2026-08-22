import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MyAttendanceService {

    readonly URL = environment.apiUrl;
  
    constructor(private http: HttpClient) {}
  
    getMyAttendanceByID(ID: any,startDate:any,endDate:any,userRoleId:any,centreID:any): Observable<any> {
      return this.http.get(this.URL + "/Attendance/getMyAttendanceByID", { params: { ID,startDate,endDate,userRoleId,centreID } });
    }

    getCurrentMonthAttendanceSummaryByID(ID: any,userRoleId:any , centreID:any): Observable<any> {
      return this.http.get(this.URL + "/Attendance/getCurrentMonthAttendanceSummaryByID", { params: { ID,userRoleId,centreID} });
    }

    getDaycareSeasonalHolidayList(dayCareID: any): Observable<any> {
      return this.http.get(this.URL + "/Centre/getDaycareSeasonalHolidayList", { params: { dayCareID} });
    }

    getStudentDetailByStudentId(id:any): Observable<any> {
      return this.http.get(this.URL + "/Classroom/getStudentProfileByStudentID",{ params: {id}});
    }

    checkTodayAttandanceStatusById(userId: any,userRoleId:any,centreID:any): Observable<any> {
      return this.http.get(this.URL + "/Attendance/checkTodayAttandanceStatusById", { params: { userId,userRoleId, centreID} });
    }

}
