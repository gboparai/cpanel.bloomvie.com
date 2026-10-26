import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class ViewTeacherService {

  private readonly rootUrl: string = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getAttendingTeachersInfo(centerID: any, userRoleId: any, loginId: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + '/Dashboard/getAttendingTeachersInfo', { params: { centerID, userRoleId, loginId } });
  }

  getTeacherDetailByStudentParentId(parentId: any, studentId: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + '/Dashboard/getTeacherDetailByStudentParentId', { params: { parentId, studentId } });
  }
}
