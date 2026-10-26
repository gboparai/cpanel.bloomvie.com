import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse, ForInterestedAppliedJobTOCItem, JobPostingItem } from '../../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  
  readonly URL = environment.apiUrl;

  constructor(private http: HttpClient) { }

  manageApproval(approveForm: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.URL + "/SubscriptionPlans/manageApproval", approveForm);
  }

  getAllJobs(status: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + "/SubscriptionPlans/getJobpostingAllList", { params: { status } });
  }
  
  getInterestedDayCare(UserType: any, name: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + "/Dashboard/getInterestedDayCare", { params: { UserType, name } });
  }

  getDashBoardCount(UserTypeID: any, UserID: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + "/Dashboard/getDashBoardCount", { params: { UserTypeID, UserID } });
  }

  getAppliedJobTOCListByStatus(Name: any, statusID: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + "/Frontend/getAppliedJobTOCListByStatus", { params: { Name, statusID } });
  }
}
