import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse, SubscriptionPlanItem } from '../../../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionDetailsService {

  readonly URL = environment.apiUrl;
  private getPlans = "/SubscriptionPlans/getAllSubscriptionPlans";
  private activeInactive = '/SubscriptionPlans/activeInActiveSubscriptionPlansByID'

  constructor(private http: HttpClient) { }

  getDetails(getForm: any): Observable<ApiResponse<SubscriptionPlanItem[]>> {
    return this.http.post<ApiResponse<SubscriptionPlanItem[]>>(this.URL + this.getPlans, getForm);
  }
  activeInActiveSubscriptionPlansByID(Id: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + this.activeInactive, { params: { Id } });
  }
}
