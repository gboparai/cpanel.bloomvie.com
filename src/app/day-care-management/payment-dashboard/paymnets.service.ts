import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NumberSymbol } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class PaymnetsService {

  private readonly RootURL:string=environment.apiUrl;
  constructor(private http:HttpClient) { }

getAllSubscriptionPlans(paginationBo:any):Observable<any>
{
  return this.http.post(this.RootURL+"/SubscriptionPlans/getSubscriptionPlanPayment",paginationBo)
}


getSubscriptionByID(id:NumberSymbol):Observable<any>
{
  return this.http.get(this.RootURL+"/SubscriptionPlans/getSubscriptionPlanPaymentById",{params:{id}})
}

getAllMasterStatus():Observable<any>
{
  return this.http.get(this.RootURL+"/SubscriptionPlans/getAllMasterStatus")
}
}
