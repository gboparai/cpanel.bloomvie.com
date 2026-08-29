import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from 'express';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ParentDashboardService {
  private readonly rootUrl: string = environment.apiUrl;
  constructor(private http: HttpClient) {}

  CheckParentOnboarding(studentID: number): Observable<any> {
    return this.http.get<any>(
      this.rootUrl + '/DayCareCentreUser/CheckParentOnboarding',
      { params: { studentID } }
    );
  }

  getTeacherCount(id: any): Observable<any> {
    return this.http.get<any>(
      this.rootUrl + '/Dashboard/getTeacherCountforParentDashboard',
      { params: { id } }
    );
  }

  getEventByStudentID(studentID: number): Observable<any> {
    return this.http.get<any>(this.rootUrl + '/Dashboard/getEventByStudentID', {
      params: { studentID },
    });
  }

  getAllPendingPaymentsByStudentID(StudentID: number): Observable<any> {
    return this.http.get<any>(
      this.rootUrl + '/Dashboard/getAllPendingPaymentsByStudentID',
      { params: { StudentID } }
    );
  }

  ClearStudentPendingPayments(clearPayment: any[], CentreID: number) {
    return this.http.post<any>(
      this.rootUrl + `/SubscriptionPayment/ClearStudentPendingPayments`,
      clearPayment,
      { params: { CentreID } }
    );
  }
}
