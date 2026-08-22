import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  
  readonly URL = environment.apiUrl;

  constructor(private http:HttpClient) { }

  manageApproval(approveForm:any): Observable<any> {
    return this.http.post<any>(this.URL + "/SubscriptionPlans/manageApproval", approveForm);
  }

  getAllJobs(status: any):Observable<any>{
    return this.http.get<any>(this.URL + "/SubscriptionPlans/getJobpostingAllList",{params:{status}})
  }
  
 getInterestedDayCare(UserType:any, name:any):Observable<any>{
    return this.http.get(this.URL+"/Dashboard/getInterestedDayCare",{params:{UserType, name}})
  }


  getDashBoardCount(UserTypeID:any, UserID:any) : Observable<any>
  {
    return this.http.get(this.URL+"/Dashboard/getDashBoardCount",{params:{UserTypeID,UserID}})
  }

  getAppliedJobTOCListByStatus(Name:any,statusID:any):Observable<any>{
    return this.http.get(this.URL+"/Frontend/getAppliedJobTOCListByStatus",{params: {Name,statusID}});
  }
}
