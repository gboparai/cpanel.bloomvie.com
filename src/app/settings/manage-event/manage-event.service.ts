import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiResponse, MasterEventItem } from '../../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class ManageEventService {

  private rootURL: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  manageMasterEvent(data: MasterEventItem | any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.rootURL + '/Common/manageMasterEvent', data);
  }

  getMasterEvent(userID: any, UserRoleID: any, type: any): Observable<ApiResponse<MasterEventItem[]>> {
    return this.http.get<ApiResponse<MasterEventItem[]>>(this.rootURL + '/Common/getMasterEvent', { params: { userID, UserRoleID, type } });
  }

  activeInActiveEventID(id: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootURL + '/Common/activeInActiveEventID', { params: { id } });
  }
}
