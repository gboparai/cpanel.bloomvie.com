import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, SubscriptionPlanItem } from '../../models/api.types';

@Injectable({
  providedIn: 'root',
})
export class AddDiscountService  {
  

  
  
  private readonly rootURL: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCustomPlanByUserID(ID: number, ageGroupID: number): Observable<ApiResponse<SubscriptionPlanItem[]>> {
    return this.http.get<ApiResponse<SubscriptionPlanItem[]>>(
      this.rootURL + '/SubscriptionPlans/getAllCustomPlanByUserID',
      { params: { ID, ageGroupID } }
    );
  }

  geDiscountByPlanID(planID: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      this.rootURL + '/SubscriptionPlans/geDiscountByPlanID',
      { params: { planID } }
    );
  }

  sendPaymentMailToParent(obj: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      this.rootURL + '/SubscriptionPlans/sendPaymentMailToParent',
      obj
    );
  }

  getAllSubscriptionPlansForFrontEnd(frontBO: any): Observable<ApiResponse<SubscriptionPlanItem[]>> {
    return this.http.post<ApiResponse<SubscriptionPlanItem[]>>(
      `${this.rootURL}/Frontend/getAllSubscriptionPlansForFrontEnd`,
      frontBO
    );
  }

  sendDiscountFormMail(DiscountFormBO: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.rootURL}/DayCareCentreUser/sendDiscountFormMail`,
      DiscountFormBO
    );
  }

  getAllEnrolledStudentsRecord(CentreID: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.rootURL}/SubscriptionPlans/getAllEnrolledStudentsRecord`,
      { params: { CentreID } }
    );
  }
  
}

