import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, SubscriptionPlanItem } from '../../../models/api.types';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionPlansService {
  readonly URL = environment.apiUrl;
  postPlan = '/SubscriptionPlans/manageSubscriptionPlans';
  ActiveInactivePlanById =
    '/SubscriptionPlans/activeInActiveSubscriptionPlansByID';

  constructor(private http: HttpClient) {}

  manageSubscription(plans: SubscriptionPlanItem[] | any[]): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.URL + this.postPlan, plans);
  }

  activeInActiveSubscriptionPlansByID(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + this.ActiveInactivePlanById, {
      params: { id },
    });
  }

  CheckJobPostFeatureExists(featureList: any[], userRoleId: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      this.URL + '/SubscriptionPlans/CheckJobPostFeatureExists',
      featureList, { params: { userRoleId } }
    );
  }

  PlanAlreadyAssignedOrNot(PlanID: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      this.URL + '/SubscriptionPlans/PlanAlreadyAssignedOrNot',
      { params: { PlanID } }
    );
  }
}
