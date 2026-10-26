import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class BookKeepingService {
  readonly URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getSubscriptionDetails(startDate: any, endDate: any, Name: any, userRoleId: number, loggedinUserID: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + "/Common/getPaymentdetails", { params: { startDate, endDate, Name, userRoleId, loggedinUserID } });
  }

  getUpcomingPaymentDetails(startDate: any, endDate: any, Name: any, userRoleId: number, loggedinUserID: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + "/Common/getUpcomingPaymentDetails", { params: { startDate, endDate, Name, userRoleId, loggedinUserID } });
  }

  getInvoice(orderID: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + "/Common/getInvoice", { params: { orderID } });
  }
}
