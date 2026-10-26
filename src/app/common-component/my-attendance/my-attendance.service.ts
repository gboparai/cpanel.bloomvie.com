import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse, AttendanceDetail, AttendanceSummary } from '../../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class MyAttendanceService {

  readonly URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMyAttendanceByID(ID: any, startDate: any, endDate: any, userRoleId: any, centreID: any): Observable<ApiResponse<AttendanceDetail[]>> {
    return this.http.get<ApiResponse<AttendanceDetail[]>>(this.URL + "/Attendance/getMyAttendanceByID", { params: { ID, startDate, endDate, userRoleId, centreID } });
  }

  getCurrentMonthAttendanceSummaryByID(ID: any, userRoleId: any, centreID: any): Observable<ApiResponse<AttendanceSummary>> {
    return this.http.get<ApiResponse<AttendanceSummary>>(this.URL + "/Attendance/getCurrentMonthAttendanceSummaryByID", { params: { ID, userRoleId, centreID } });
  }

  getDaycareSeasonalHolidayList(dayCareID: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + "/Centre/getDaycareSeasonalHolidayList", { params: { dayCareID } });
  }

  getStudentDetailByStudentId(id: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + "/Classroom/getStudentProfileByStudentID", { params: { id } });
  }

  checkTodayAttandanceStatusById(userId: any, userRoleId: any, centreID: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + "/Attendance/checkTodayAttandanceStatusById", { params: { userId, userRoleId, centreID } });
  }
}
