import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class ManageTeacherService {
  private readonly rootURL: string = environment.apiUrl;
  constructor(private http: HttpClient) { }

  manageTeacher(Data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.rootURL + '/DayCareCentreUser/manageTeacher', Data);
  }

  getuserBankingInfo(UserID: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootURL + '/DayCareCentreUser/getUserbankingInfo', { params: { UserID } });
  }

  getStaffTransferedDetailsByCentreID(centreID: number, UserRoleID: number, status: any, type: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootURL + '/Common/getStaffTransferedDetailsByCentreID', { params: { centreID, UserRoleID, status, type } });
  }

  getPendingStudentAttendance(teacherId: number, days: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootURL + '/Centre/GetPendingStudentAttendanceByTeacherId', { params: { teacherId, days } });
  }
}
