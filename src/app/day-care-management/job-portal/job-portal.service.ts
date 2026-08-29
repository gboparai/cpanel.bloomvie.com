import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JobPortalService {
  readonly URL = environment.apiUrl;

  constructor(private http: HttpClient) { }

  manageJobsPosting(formDataArray: any):Observable <any>{
    return this.http.post<any>( this.URL + "/SubscriptionPlans/manageJobPosting",formDataArray )
  }

  getJobType():Observable <any>{
    return this.http.get<any>(this.URL+"/Frontend/getJobType")
  }

  getAvaiableJobPostsCount( CentreID:any):Observable<any>{
    return this.http.get<any>(this.URL+"/SubscriptionPlans/getAvaiableJobPostsCount",{params:{CentreID}})
  }
  UpgradeJobPostingAfterPayment(upgradeJobPostingsPaymentModel:any):Observable<any>{
    return this.http.post<any>( this.URL + "/SubscriptionPlans/UpgradeJobPostingAfterPayment",upgradeJobPostingsPaymentModel )
  }
  getAllJobPostPlans():Observable<any>{
    return this.http.get<any>(this.URL+"/SubscriptionPlans/getAllJobPostPlans")
  }
}
