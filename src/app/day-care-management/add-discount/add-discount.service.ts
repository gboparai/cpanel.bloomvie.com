import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AddDiscountService  {
  

  
  
  private readonly rootURL: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCustomPlanByUserID(ID: number, ageGroupID: number): Observable<any> {
    return this.http.get<any>(
      this.rootURL + '/SubscriptionPlans/getAllCustomPlanByUserID',
      { params: { ID, ageGroupID } }
    );
  }

  geDiscountByPlanID(planID: number): Observable<any> {
    return this.http.get<any>(
      this.rootURL + '/SubscriptionPlans/geDiscountByPlanID',
      { params: { planID } }
    );
  }

  sendPaymentMailToParent(obj: any): Observable<any> {
    return this.http.post<any>(
      this.rootURL + '/SubscriptionPlans/sendPaymentMailToParent',
      obj
    );
  }

  getAllSubscriptionPlansForFrontEnd(frontBO: any): Observable<any> {
    return this.http.post<any>(
      `${this.rootURL}/Frontend/getAllSubscriptionPlansForFrontEnd`,
      frontBO
    );
  }

  sendDiscountFormMail(DiscountFormBO: any): Observable<any> {
    return this.http.post<any>(
      `${this.rootURL}/DayCareCentreUser/sendDiscountFormMail`,
      DiscountFormBO
    );
  }

  getAllEnrolledStudentsRecord(CentreID: number): Observable<any> {
    return this.http.get<any>(
      `${this.rootURL}/SubscriptionPlans/getAllEnrolledStudentsRecord`,
      { params: { CentreID } }
    );
  }
  
}

