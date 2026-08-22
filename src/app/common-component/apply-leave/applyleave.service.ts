import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApplyleaveService {

  rootUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  manageLeaves(request: any) : Observable<any> {
    return this.http.post(this.rootUrl + "/Attendance/MarkEmployeeLeave", request)
  }



 getEmployeeLeave(employeeId:any,centreID:any, userRoleID:any, startDate:any, endDate:any): Observable<any> {
      return this.http.get<any>(this.rootUrl + '/Attendance/getEmployeeLeave',{params:{employeeId,centreID, userRoleID, startDate, endDate}});
    }
      getTocSlotbyUserid(UserId:any,CentreId:any):Observable<any>
  {
    return this.http.get(this.rootUrl+"/Frontend/getTocSlotbyUserid",{params:{UserId,CentreId}})
  }

}
