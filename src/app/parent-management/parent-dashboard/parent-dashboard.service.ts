import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import {
  ApiResponse,
  ClearStudentPaymentItem,
} from '../../models/api.types';

@Injectable({
  providedIn: 'root',
})
export class ParentDashboardService {
  private readonly rootUrl: string = environment.apiUrl;
  constructor(private http: HttpClient) {}

  CheckParentOnboarding(studentID: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      this.rootUrl + '/DayCareCentreUser/CheckParentOnboarding',
      { params: { studentID } }
    );
  }

  getTeacherCount(id: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      this.rootUrl + '/Dashboard/getTeacherCountforParentDashboard',
      { params: { id } }
    );
  }

  getEventByStudentID(studentID: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + '/Dashboard/getEventByStudentID', {
      params: { studentID },
    });
  }

  getAllPendingPaymentsByStudentID(StudentID: number): Observable<ApiResponse<ClearStudentPaymentItem[]>> {
    return this.http.get<ApiResponse<ClearStudentPaymentItem[]>>(
      this.rootUrl + '/Dashboard/getAllPendingPaymentsByStudentID',
      { params: { StudentID } }
    );
  }

  ClearStudentPendingPayments(clearPayment: ClearStudentPaymentItem[] | any[], CentreID: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      this.rootUrl + `/SubscriptionPayment/ClearStudentPendingPayments`,
      clearPayment,
      { params: { CentreID } }
    );
  }
}
