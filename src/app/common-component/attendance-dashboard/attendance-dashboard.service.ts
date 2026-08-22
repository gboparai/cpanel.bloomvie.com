import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AttendanceDashboardService {
  readonly URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAttendanceByID(ID: any,startDate:any,endDate:any): Observable<any> {
    return this.http.get(this.URL + "/Attendance/getAttendanceByID", { params: { ID,startDate,endDate } });
  }

  getstaffAttendanceByCentreID(centreID: any,startDate:any,endDate:any,userRoleId:any,classId:any): Observable<any> {
    return this.http.get(this.URL + "/Attendance/getstaffAttendanceByCentreID", { params: { centreID,startDate,endDate,userRoleId,classId } });
  }

  getEmployeeAllDetails(centreID: any,startDate:any,endDate:any,userRoleId:any, employeeID:any): Observable<any> {
    return this.http.get(this.URL + "/Attendance/getEmployeeAllDetails", { params: { centreID,startDate,endDate,userRoleId, employeeID } });
  }

  getTodayAttendanceSummaryByCentreID(centreID: any,userRoleId:any): Observable<any> {
    return this.http.get(this.URL + "/Attendance/getTodayAttendanceSummaryByCentreID", { params: { centreID,userRoleId} });
  }

  getDayCareByID(ID: any): Observable<any> {
    return this.http.get(this.URL + '/Centre/getCentreByID', { params: { ID }});
  }
}
