import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse, JobPostingItem } from '../../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class JobPortalService {
  readonly URL = environment.apiUrl;

  constructor(private http: HttpClient) { }

  manageJobsPosting(formDataArray: JobPostingItem | any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.URL + "/SubscriptionPlans/manageJobPosting", formDataArray);
  }

  getJobType(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + "/Frontend/getJobType");
  }

  getAvaiableJobPostsCount(CentreID: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + "/SubscriptionPlans/getAvaiableJobPostsCount", { params: { CentreID } });
  }
  UpgradeJobPostingAfterPayment(upgradeJobPostingsPaymentModel: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.URL + "/SubscriptionPlans/UpgradeJobPostingAfterPayment", upgradeJobPostingsPaymentModel);
  }
  getAllJobPostPlans(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + "/SubscriptionPlans/getAllJobPostPlans");
  }
}
