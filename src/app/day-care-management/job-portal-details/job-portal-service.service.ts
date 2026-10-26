import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse, ForInterestedAppliedJobPostingItem, JobPostingItem } from '../../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class JobPortalServiceService {

  constructor(private http: HttpClient) { }

  readonly URL = environment.apiUrl;

  getAllJobPostings(dayCareID: any, Status: any): Observable<ApiResponse<JobPostingItem[]>> {
    return this.http.get<ApiResponse<JobPostingItem[]>>(this.URL + "/SubscriptionPlans/getAllJobPostingsByDayCareID", { params: { dayCareID, Status } });
  }

  getJobByID(id: number): Observable<ApiResponse<JobPostingItem>> {
    return this.http.get<ApiResponse<JobPostingItem>>(this.URL + "/SubscriptionPlans/getJobPostingByID", { params: { id } });
  }

  activeInActiveByID(id: any, isActive: boolean): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + "/SubscriptionPlans/activeInActiveByID", { params: { id, isActive } });
  }

  getAppliedJobPostings(id: any): Observable<ApiResponse<ForInterestedAppliedJobPostingItem[]>> {
    return this.http.get<ApiResponse<ForInterestedAppliedJobPostingItem[]>>(this.URL + "/Frontend/getAppliedJobPostingByCentreID", { params: { id } });
  }

  getAppliedJobPosting(CenterId: any, Search: any, JobID: any, status: any): Observable<ApiResponse<ForInterestedAppliedJobPostingItem[]>> {
    return this.http.get<ApiResponse<ForInterestedAppliedJobPostingItem[]>>(this.URL + "/Frontend/getAppliedJobPostingByCentreID", { params: { CenterId, Search, JobID, status } });
  }

  manageTeacherApproval(approveForm: any, approvalType: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.URL + "/Frontend/manageApproval", approveForm, { params: { approvalType } });
  }

  manageApproval(approveForm: any, approvalType: any, encryptedUserID: any, encryptedCentreID: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.URL + "/Frontend/manageApproval", approveForm, { params: { approvalType, encryptedUserID, encryptedCentreID } });
  }

  ValidateToken(teacherID: any, token: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + "/Frontend/ValidateToken", { params: { teacherID, token } });
  }

  getDaycareCentreJobPosting(centreID: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + "/Centre/getDaycareCentreJobPostingByCentreID", { params: { centreID } });
  }
}
