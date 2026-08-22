import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class StudentServiceService {
  private readonly ApiURL: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getStudentsTransactionDetailsByCentreAdminID(
    AdminID: number,
    PaymentType: string,
    searchText: string,
    startDate: any,
    endDate: any
  ): Observable<any> {
    return this.http.get<any>(
      `${this.ApiURL}/SubscriptionPayment/getStudentsTransactionDetailsByCentreAdminID`,
      { params: { AdminID, PaymentType, searchText, startDate, endDate } }
    );
  }

  sendActions(
    actionType: string,
    planID: number,
    senderID: number,
    studentID: number
  ): Observable<any> {
    return this.http.post<any>(
      `${this.ApiURL}/SubscriptionPlans/sendRequiredAction`,
      {},
      { params: { actionType, planID, senderID, studentID } }
    );
  }

  getAllStudentPendingPaymentRecordByDaycareAdminID(
    DaycareAdminID: number
  ): Observable<any> {
    return this.http.get<any>(
      `${this.ApiURL}/SubscriptionPayment/getAllStudentPendingPaymentRecordByDaycareAdminID`,
      { params: { DaycareAdminID } }
    );
  }
}
