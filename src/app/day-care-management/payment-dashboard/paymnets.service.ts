import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class PaymnetsService {

  private readonly RootURL: string = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getAllSubscriptionPlans(paginationBo: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.RootURL + "/SubscriptionPlans/getSubscriptionPlanPayment", paginationBo);
  }

  getSubscriptionByID(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.RootURL + "/SubscriptionPlans/getSubscriptionPlanPaymentById", { params: { id } });
  }

  getAllMasterStatus(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.RootURL + "/SubscriptionPlans/getAllMasterStatus");
  }
}
