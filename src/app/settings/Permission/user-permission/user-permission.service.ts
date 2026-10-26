import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, UserPermissionItem } from '../../../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class UserPermissionService {
  readonly rootUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getUserRolePermissionByUserRoleID(UserRoleID: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      this.rootUrl + '/MenuPermission/getUserRolePermissionByID',
      { params: { UserRoleID } }
    );
  }
  assignRolePermissionToUser(obj: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.rootUrl + '/MenuPermission/assignPermissionToUser', obj);
  }

  assignPermissionToUserRole(UserRoleID: any, menus: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.rootUrl + '/MenuPermission/assignPermissionToUserRole', menus, { params: { UserRoleID } });
  }

  assignPermissionToRole(UserRoleID: any, menus: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.rootUrl + '/MenuPermission/assignPermissionToUserRole', menus, {
      params: { UserRoleID },
    });
  }

  getAllUsers(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + '/User/getAllUser');
  }

  getUserPermissionByUserID(UserID: any): Observable<ApiResponse<UserPermissionItem[]>> {
    return this.http.get<ApiResponse<UserPermissionItem[]>>(this.rootUrl + '/MenuPermission/getUserPermissionByUserID', { params: { UserID } });
  }

  checkTOCUserAcceptedSlotRequest(userID: any, centreID: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + '/Login/checkTOCUserAcceptedSlotRequest', { params: { userID, centreID } });
  }
}


