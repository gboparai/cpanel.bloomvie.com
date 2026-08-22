import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { __param } from 'tslib';

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

  subscriptionFeature(value: any): Observable<any> {
    return this.http.post<any>(this.URL + this.featureApi, value)
  }

  getFeatures(getForm: any): Observable<any> {
    return this.http.post<any>(this.URL + this.getFeature, getForm)
  }

  getAllUnits(): Observable<any> {
    return this.http.get<any>(this.URL + this.getUnits)
  }
  deleteFeature(id: any): Observable<any> {
    return this.http.delete<any>(this.URL + "/SubscriptionPlans/deleteFeature", { params: { id } })
  }

  activeInActiveSubscriptionFeaturesByID(Id: any): Observable<any> {
    return this.http.get<any>(this.URL + this.activeIn, { params: { Id } })
  }
  GetSubscriptionPlanandFeaturesByUserId(UserId: any, type: string): Observable<any> {
    return this.http.get<any>(this.URL + this.GetSubscriptionPlanandFeatures, { params: { UserId, type } })
  }

}