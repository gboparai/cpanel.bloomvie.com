import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionDetailsService {

  readonly URL = environment.apiUrl;
  private getPlans = "/SubscriptionPlans/getAllSubscriptionPlans";
  private activeInactive = '/SubscriptionPlans/activeInActiveSubscriptionPlansByID'

  constructor(private http: HttpClient) { }

  // getDetails(IsActive: any, SearchText: any): Observable<any> {
  //   const requestBody = { IsActive, SearchText };
  //   return this.http.post(this.URL + this.getPlans, requestBody);
  // }
  getDetails(getForm: any):Observable <any>{
    return this.http.post<any>(this.URL + this.getPlans,getForm )
  }
  activeInActiveSubscriptionPlansByID(Id: any): Observable<any> {
    return this.http.get<any>(this.URL + this.activeInactive, { params: { Id } })
  }

  

}
