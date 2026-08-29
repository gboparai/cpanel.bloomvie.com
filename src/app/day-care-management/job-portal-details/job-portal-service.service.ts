import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JobPortalServiceService {

  constructor(private http:HttpClient) { }

  readonly URL = environment.apiUrl;

  getAllJobPostings(dayCareID: any,Status: any):Observable <any>{
    return this.http.get<any>(this.URL + "/SubscriptionPlans/getAllJobPostingsByDayCareID",{params:{dayCareID,Status}} )
  }

  getJobByID(id:number):Observable<any>{
    return this.http.get<any>(this.URL + "/SubscriptionPlans/getJobPostingByID",{params:{id}})
  }

  activeInActiveByID(id:any,isActive:boolean):Observable<any>{
    return this.http.get<any>(this.URL + "/SubscriptionPlans/activeInActiveByID",{params:{id,isActive}})
  }


  getAppliedJobPostings(id: any):Observable <any>{
    return this.http.get<any>(this.URL + "/Frontend/getAppliedJobPostingByCentreID",{params:{id}} )
  }

  getAppliedJobPosting(CenterId:any,Search:any,JobID:any,status:any):Observable<any>
  {
    return this.http.get(this.URL+"/Frontend/getAppliedJobPostingByCentreID" ,{params:{CenterId,Search,JobID,status}})
  }

  manageTeacherApproval(approveForm:any,approvalType:any ): Observable<any> {
    return this.http.post<any>(this.URL + "/Frontend/manageApproval",approveForm,{params:{approvalType}});
  }

    manageApproval(approveForm:any,approvalType:any, encryptedUserID:any, encryptedCentreID:any): Observable<any> {
    return this.http.post<any>(this.URL + "/Frontend/manageApproval",approveForm,{params:{approvalType, encryptedUserID, encryptedCentreID}});
  }

  ValidateToken(teacherID:any,token:any): Observable<any> {
    return this.http.get<any>(this.URL + "/Frontend/ValidateToken",{params:{teacherID, token}});
  }

  

  getDaycareCentreJobPosting(centreID:any): Observable<any> {
    return this.http.get<any>(this.URL + "/Centre/getDaycareCentreJobPostingByCentreID",{params:{centreID}});
  }
}
