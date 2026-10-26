import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse, SubscriptionFeatureItem } from '../../../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionFeaturesService {
  readonly URL = environment.apiUrl;
  private featureApi = "/SubscriptionPlans/manageSubscriptionFeatures";
  private getFeature = "/SubscriptionPlans/getAllSubscriptionFeatures";
  private activeIn = '/SubscriptionPlans/activeInActiveSubscriptionFeaturesByID';
  private getUnits = '/SubscriptionPlans/getunitMasters';
  private GetSubscriptionPlanandFeatures = '/SubscriptionPlans/GetSubscriptionPlanandFeaturesByUserId';

  constructor(private http: HttpClient) { }

  subscriptionFeature(value: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.URL + this.featureApi, value);
  }

  getFeatures(getForm: any): Observable<ApiResponse<SubscriptionFeatureItem[]>> {
    return this.http.post<ApiResponse<SubscriptionFeatureItem[]>>(this.URL + this.getFeature, getForm);
  }

  getAllUnits(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + this.getUnits);
  }
  deleteFeature(id: any): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(this.URL + "/SubscriptionPlans/deleteFeature", { params: { id } });
  }

  activeInActiveSubscriptionFeaturesByID(Id: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + this.activeIn, { params: { Id } });
  }
  GetSubscriptionPlanandFeaturesByUserId(UserId: any, type: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + this.GetSubscriptionPlanandFeatures, { params: { UserId, type } });
  }
}
