import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  readonly rootUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  GetUserById(ID: any, userRoleID?: any): Observable<any> {
    return this.http.get<any>(this.rootUrl + '/User/getUserProfileByID', {
      params: { ID, userRoleID },
    });
  }

  ManageUser(UserMasterBO: any): Observable<any> {
    return this.http.post<any>(this.rootUrl + '/User/manageUser', UserMasterBO);
  }
  ManageMasterDocument(MasterDocumentBO: any[]): Observable<any> {
    return this.http.post<any>(
      `${this.rootUrl}/Common/manageMasterDocument`,
      MasterDocumentBO
    );
  }

  GetMasterDocumentbyId(userID: any, type:any): Observable<any> {
    return this.http.get<any>(this.rootUrl + '/User/getMasterDocumentByID', {
      params: { userID, type },
    });
  }

  getSubscriptionPlanByUserId(
    Id: any,
    UserRoleID?: any,
    tab: string = '',
    studentID?: any
  ): Observable<any> {
    return this.http.get<any>(
      this.rootUrl + '/Frontend/getSubscriptionplanByUserId',
      { params: { Id, UserRoleID, tab, studentID } }
    );
  }

    getTOCUserCentreListById(ID: string): Observable<any> {
      return this.http.get(this.rootUrl + '/Frontend/getTOCUserCentreListById', {
        params: { ID },
      });
    }
}
