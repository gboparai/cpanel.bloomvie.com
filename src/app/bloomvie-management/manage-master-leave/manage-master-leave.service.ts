import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class ManageMasterLeaveService {
  private readonly BaseURL: string = environment.apiUrl;
  constructor(private http: HttpClient) { }

  public manageLeave(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.BaseURL + '/Common/UpsertLeaveType', payload);
  }

  public upsertDaycareLeave(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.BaseURL + '/Common/UpsertDaycareLeave', payload);
  }

  public getLeaveList(CentreId: number, userType: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.BaseURL + '/Common/GetLeaveTypeList', { params: { CentreId, userType } });
  }

  public getAssignedLeavesByDaycareId(daycareId: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.BaseURL + '/Common/getAssignedLeavesByDaycareId', { params: { daycareId } });
  }

  public activeInactive(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.BaseURL + '/Common/ActiveInactiveLeaveType', { params: { id } });
  }

  public activeInactiveDaycareLeaveAssignment(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.BaseURL + '/Common/ActiveInactiveDaycareLeaveAssignment', { params: { id } });
  }
}
