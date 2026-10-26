import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ApiResponse, ClearStudentPaymentItem } from '../../../models/api.types';

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
  ): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.ApiURL}/SubscriptionPayment/getStudentsTransactionDetailsByCentreAdminID`,
      { params: { AdminID, PaymentType, searchText, startDate, endDate } }
    );
  }

  sendActions(
    actionType: string,
    planID: number,
    senderID: number,
    studentID: number
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.ApiURL}/SubscriptionPlans/sendRequiredAction`,
      {},
      { params: { actionType, planID, senderID, studentID } }
    );
  }

  getAllStudentPendingPaymentRecordByDaycareAdminID(
    DaycareAdminID: number
  ): Observable<ApiResponse<ClearStudentPaymentItem[]>> {
    return this.http.get<ApiResponse<ClearStudentPaymentItem[]>>(
      `${this.ApiURL}/SubscriptionPayment/getAllStudentPendingPaymentRecordByDaycareAdminID`,
      { params: { DaycareAdminID } }
    );
  }
}
