import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { rootCertificates } from 'tls';

@Injectable({
  providedIn: 'root'
})
export class ViewDaycareService {
private readonly RootURL:string=environment.apiUrl;
  constructor(private http:HttpClient) { }

  getDayCareList(adminId:number,roleId:number,pageSize:number,pageIndex:number,searchString:string):Observable<any>{
    return this.http.get<any>(this.RootURL+'/Centre/getDaycareCenterList',{params:{adminId,roleId,pageSize,pageIndex,searchString}});
  }
  activeInactiveDaycare(ID:number):Observable<any>{
    return this.http.get<any>(this.RootURL+'/Centre/activeInactiveDayCare',{params:{ID}});
  }
  onSearchDaycare(centreSpelling:string):Observable<any>{
    return this.http.get<any>(this.RootURL+'/Centre/onSearchDaycare',{params:{centreSpelling}});
  }
  getDaycareDetail(ID:number):Observable<any>{ 
    return this.http.get<any>(this.RootURL+'/Centre/getDaycareCenterInformationByID',{params:{ID}});
  }

  // onSuspendPlan(centreID:number):Observable<any>{
  //   return this.http.get<any>(this.RootURL+'/Centre/onSuspendPlanByCentreID',{params:{centreID}});
  // }

  onSuspendPlan(centreID: number, IsSuspend: boolean | null): Observable<any> {
    let params: any = { centreID };
  
    if (IsSuspend !== null && IsSuspend !== undefined) {
      params.IsSuspend = IsSuspend;
    }
  
    return this.http.get<any>(this.RootURL + '/Centre/onSuspendPlanByCentreID', { params });
  }
  
  
}
