import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class BookKeepingService {
  readonly URL = environment.apiUrl

  constructor(private http:HttpClient) {}

  getSubscriptionDetails(startDate:any,endDate:any,Name:any,userRoleId:number,loggedinUserID:any):Observable<any>{
    return this.http.get(this.URL + "/Common/getPaymentdetails",{params:{startDate,endDate,Name,userRoleId,loggedinUserID}});
  }

  getUpcomingPaymentDetails(startDate:any,endDate:any,Name:any,userRoleId:number,loggedinUserID:any):Observable<any>{
    return this.http.get(this.URL + "/Common/getUpcomingPaymentDetails",{params:{startDate,endDate,Name,userRoleId,loggedinUserID}})
  }

  getInvoice(orderID:any):Observable<any>
  {
    return this.http.get(this.URL + "/Common/getInvoice",{params:{orderID}})
  }

}
