import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionPlansService {
  readonly URL = environment.apiUrl;
  postPlan = '/SubscriptionPlans/manageSubscriptionPlans';
  ActiveInactivePlanById =
    '/SubscriptionPlans/activeInActiveSubscriptionPlansByID';

  constructor(private http: HttpClient) {}

  // manageSubscription(subscriptionData: any): Observable<any> {
  //   return this.http.post(this.URL+ this.postPlan, subscriptionData);
  // }
  manageSubscription(plans: any[]): Observable<any> {
    return this.http.post(this.URL + this.postPlan, plans);
  }

  // activeInActiveSubscriptionPlansByID(PlanId:any):Observable<any>{
  //   return this.http.get<any>(this.URL+ this.ActiveInactivePlanById ,{params:{PlanId}})
  //  }
  activeInActiveSubscriptionPlansByID(id: number): Observable<any> {
    //const params = new HttpParams().set('id', planId.toString()); // Set 'id' as the key
    return this.http.get<any>(this.URL + this.ActiveInactivePlanById, {
      params: { id },
    });
  }

  CheckJobPostFeatureExists(featureList: any[],userRoleId:any): Observable<any> {
    return this.http.post<any>(
      this.URL + '/SubscriptionPlans/CheckJobPostFeatureExists',
      featureList, { params: { userRoleId } }
    );
  }

  PlanAlreadyAssignedOrNot(PlanID: number): Observable<any> {
    return this.http.get<any>(
      this.URL + '/SubscriptionPlans/PlanAlreadyAssignedOrNot',
      { params: { PlanID } }
    );
  }
}
