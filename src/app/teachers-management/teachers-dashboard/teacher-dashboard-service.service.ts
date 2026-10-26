import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse, DaycareEventItem } from '../../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class TeacherDashboardServiceService {

  rootUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getTeacherDashboardCount(userID: any, DaycareID: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.rootUrl}/Dashboard/getTeacherDashboardCount`, { params: { userID, DaycareID } });
  }

  getDayCareEventsByID(dayCareID: any): Observable<ApiResponse<DaycareEventItem[]>> {
    return this.http.get<ApiResponse<DaycareEventItem[]>>(`${this.rootUrl}/Dashboard/getEventsByDayCareId`, { params: { dayCareID } });
  }

  getDayCareActivities(dayCareID: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.rootUrl}/Dashboard/getActivitesByCenterId`, { params: { dayCareID } });
  }

  getEmployeeJoiningDocuments(userID: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.rootUrl}/Frontend/getEmployeeJoiningDocumentsByUserID`, { params: { userID } });
  }

  employeeJoiningDocuments(userID: any, letterAccepted: any, letterSignature: any, acceptanceIP: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.rootUrl}/Frontend/manageEmployeeJoiningDocuments`, { params: { userID, letterAccepted, letterSignature, acceptanceIP } });
  }

  getAllEventManagementType(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.rootUrl}/Common/getAllEventManagementType`);
  }

  getDashboardPendingStudentAttandanceByuserId(userId: any, userRoleId: any, centreId: any, studentId: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.rootUrl}/Dashboard/getDashboardPendingStudentAttandanceByuserId`, { params: { userId, userRoleId, centreId, studentId } });
  }
}
