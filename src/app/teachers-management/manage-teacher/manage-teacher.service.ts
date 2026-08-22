import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ManageTeacherService {
  private readonly rootURL:string=environment.apiUrl;
  constructor(private http:HttpClient) { }

  manageTeacher(Data:any):Observable<any>{
    return this.http.post<any>(this.rootURL+'/DayCareCentreUser/manageTeacher',Data)
  }

  getuserBankingInfo(UserID:number):Observable<any>{
    return this.http.get<any>(this.rootURL+'/DayCareCentreUser/getUserbankingInfo',{params:{UserID}});
  }


  getStaffTransferedDetailsByCentreID(centreID:number , UserRoleID:number, status:any, type:any):Observable<any>{
    return this.http.get<any>(this.rootURL+'/Common/getStaffTransferedDetailsByCentreID',{params:{centreID,UserRoleID, status, type}});
  }

  getPendingStudentAttendance(teacherId: number, days: string):Observable<any>{
    return this.http.get<any>(this.rootURL+'/Centre/GetPendingStudentAttendanceByTeacherId',{params:{teacherId, days}});
  }

  



}
