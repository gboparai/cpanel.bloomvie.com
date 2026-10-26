import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, AttendanceDetail, AttendanceSummary } from '../../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class AttendanceDashboardService {
  readonly URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAttendanceByID(ID: any, startDate: any, endDate: any): Observable<ApiResponse<AttendanceDetail[]>> {
    return this.http.get<ApiResponse<AttendanceDetail[]>>(this.URL + "/Attendance/getAttendanceByID", { params: { ID, startDate, endDate } });
  }

  getstaffAttendanceByCentreID(centreID: any, startDate: any, endDate: any, userRoleId: any, classId: any): Observable<ApiResponse<AttendanceDetail[]>> {
    return this.http.get<ApiResponse<AttendanceDetail[]>>(this.URL + "/Attendance/getstaffAttendanceByCentreID", { params: { centreID, startDate, endDate, userRoleId, classId } });
  }

  getEmployeeAllDetails(centreID: any, startDate: any, endDate: any, userRoleId: any, employeeID: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + "/Attendance/getEmployeeAllDetails", { params: { centreID, startDate, endDate, userRoleId, employeeID } });
  }

  getTodayAttendanceSummaryByCentreID(centreID: any, userRoleId: any): Observable<ApiResponse<AttendanceSummary>> {
    return this.http.get<ApiResponse<AttendanceSummary>>(this.URL + "/Attendance/getTodayAttendanceSummaryByCentreID", { params: { centreID, userRoleId } });
  }

  getDayCareByID(ID: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + '/Centre/getCentreByID', { params: { ID } });
  }
}
