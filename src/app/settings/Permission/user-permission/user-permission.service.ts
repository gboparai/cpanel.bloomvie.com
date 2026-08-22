import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class UserPermissionService {
  readonly rootUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }


  getUserRolePermissionByUserRoleID(UserRoleID: any): Observable<any> {
    return this.http.get(
      this.rootUrl + '/MenuPermission/getUserRolePermissionByID',
      { params: { UserRoleID } }
    );
  }
  assignRolePermissionToUser(obj: any): Observable<any> {

    return this.http.post(this.rootUrl + '/MenuPermission/assignPermissionToUser', obj);
  }

  assignPermissionToUserRole(UserRoleID: any, menus: any): Observable<any> {
    return this.http.post<any>(this.rootUrl + 'MenuPermission/assignPermissionToUserRole', UserRoleID, menus)
  }

  assignPermissionToRole(UserRoleID: any, menus: any): Observable<any> {
    return this.http.post(this.rootUrl + '/MenuPermission/assignPermissionToUserRole', menus, {
      params: { UserRoleID },
    });
  }

  getAllUsers(): Observable<any> {
    return this.http.get(this.rootUrl + '/User/getAllUser');
  }

  getUserPermissionByUserID(UserID: any): Observable<any> {
    return this.http.get(this.rootUrl + '/MenuPermission/getUserPermissionByUserID', { params: { UserID } });
  }

  checkTOCUserAcceptedSlotRequest(userID: any, centreID: any): Observable<any> {
    return this.http.get(this.rootUrl + '/Login/checkTOCUserAcceptedSlotRequest', { params: { userID, centreID } });
  }

}


