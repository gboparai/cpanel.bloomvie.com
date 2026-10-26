import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, UserRoleItem } from '../../../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class UserRoleService {
  readonly rootUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  ManageUserRole(UserRolesBO: UserRoleItem | any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.rootUrl + '/User/manageUserRole', UserRolesBO);
  }

  getAllUserRoles(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + '/User/getAllUserRoles');
  }

  activeInActiveUserRoleByID(Id: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + '/User/activeInActiveUserRoleByID', { params: { Id } });
  }

  getUserRolesByID(id: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + '/User/getUserRolesByID', { params: { id } });
  }

  userRoleRelation(dataObject: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.rootUrl + '/User/userRoleRelation', dataObject);
  }
}
