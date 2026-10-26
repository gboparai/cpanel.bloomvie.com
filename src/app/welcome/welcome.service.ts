import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ApiResponse, UserRoleItem } from '../models/api.types';

@Injectable({
  providedIn: 'root',
})
export class WelcomeService {
  readonly rootUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getAllUserRoles(userRoleID?: any): Observable<ApiResponse<UserRoleItem[]>> {
    return this.http.get<ApiResponse<UserRoleItem[]>>(
      this.rootUrl + '/User/getAllUserRoles',
      userRoleID !== undefined ? { params: { userRoleID } } : undefined
    );
  }

  getAllDayCareContent(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      this.rootUrl + '/ContentManagement/getAllDayCareContent'
    );
  }

  getDayCareFeatureByCentreID(CentreID: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      this.rootUrl + '/ContentManagement/getDayCareFeatureByCentreID',
      { params: { CentreID } }
    );
  }

  getDaycareLogos(DaycareID: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + '/User/getDaycareLogos', {
      params: { DaycareID },
    });
  }

  getCentreIDByStudentID(StudentID: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + '/Frontend/getCentreIDByStudentID', {
      params: { StudentID },
    });
  }

  getAllDayCareContentLogo(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      this.rootUrl + '/ContentManagement/getAllDayCareContentLogo'
    );
  }
}
