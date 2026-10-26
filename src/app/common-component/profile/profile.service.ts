import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, ProfileItem } from '../../models/api.types';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  readonly rootUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  GetUserById(ID: any, userRoleID?: any): Observable<ApiResponse<ProfileItem>> {
    return this.http.get<ApiResponse<ProfileItem>>(this.rootUrl + '/User/getUserProfileByID', {
      params: { ID, userRoleID },
    });
  }

  ManageUser(UserMasterBO: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.rootUrl + '/User/manageUser', UserMasterBO);
  }
  ManageMasterDocument(MasterDocumentBO: any[]): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.rootUrl}/Common/manageMasterDocument`,
      MasterDocumentBO
    );
  }

  GetMasterDocumentbyId(userID: any, type: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + '/User/getMasterDocumentByID', {
      params: { userID, type },
    });
  }

  getSubscriptionPlanByUserId(
    Id: any,
    UserRoleID?: any,
    tab: string = '',
    studentID?: any
  ): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      this.rootUrl + '/Frontend/getSubscriptionplanByUserId',
      { params: { Id, UserRoleID, tab, studentID } }
    );
  }

  getTOCUserCentreListById(ID: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + '/Frontend/getTOCUserCentreListById', {
      params: { ID },
    });
  }
}
