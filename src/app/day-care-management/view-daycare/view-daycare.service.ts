import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class ViewDaycareService {
  private readonly RootURL: string = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getDayCareList(adminId: number, roleId: number, pageSize: number, pageIndex: number, searchString: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.RootURL + '/Centre/getDaycareCenterList', { params: { adminId, roleId, pageSize, pageIndex, searchString } });
  }
  activeInactiveDaycare(ID: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.RootURL + '/Centre/activeInactiveDayCare', { params: { ID } });
  }
  onSearchDaycare(centreSpelling: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.RootURL + '/Centre/onSearchDaycare', { params: { centreSpelling } });
  }
  getDaycareDetail(ID: number): Observable<ApiResponse<any>> { 
    return this.http.get<ApiResponse<any>>(this.RootURL + '/Centre/getDaycareCenterInformationByID', { params: { ID } });
  }

  onSuspendPlan(centreID: number, IsSuspend: boolean | null): Observable<ApiResponse<any>> {
    let params: any = { centreID };
  
    if (IsSuspend !== null && IsSuspend !== undefined) {
      params.IsSuspend = IsSuspend;
    }
  
    return this.http.get<ApiResponse<any>>(this.RootURL + '/Centre/onSuspendPlanByCentreID', { params });
  }
}
