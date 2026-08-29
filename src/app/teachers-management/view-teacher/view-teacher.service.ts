import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from 'express';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ViewTeacherService {

  private readonly rootUrl :string=environment.apiUrl;
  constructor(private http:HttpClient) { }

  getAttendingTeachersInfo(centerID:any,userRoleId:any,loginId:any):Observable<any>{
    return this.http.get<any>(this.rootUrl + '/Dashboard/getAttendingTeachersInfo',{params:{centerID,userRoleId,loginId}})
  }

  getTeacherDetailByStudentParentId(parentId:any,studentId:any):Observable<any>{
    return this.http.get<any>(this.rootUrl + '/Dashboard/getTeacherDetailByStudentParentId',{params:{parentId,studentId}})
  }

}
