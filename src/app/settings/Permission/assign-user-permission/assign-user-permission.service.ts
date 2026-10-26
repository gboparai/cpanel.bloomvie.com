import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, UserRoleItem } from '../../../models/api.types';

@Injectable({
  providedIn: 'root',
})
export class AssignUserPermissionService {
  readonly URL = environment.apiUrl;
  public UserRole = '/User/getAllUserRoles';

  constructor(private http: HttpClient) {}

  // GET
  getUserRole(): Observable<ApiResponse<UserRoleItem[]>> {
    return this.http.get<ApiResponse<UserRoleItem[]>>(this.URL + this.UserRole);
  }

  getDayCare(type: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + '/Centre/getAllCentre', { params: { type } });
  }

  getEmployeeRole(userRoleId: any, isActive: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + '/User/getEmployeeRole', {
      params: { userRoleId, isActive },
    });
  }

  getassignedDcc(counsellorID: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      this.URL + '/DayCareCentreUser/getAssignedDccForCounsellor',
      {
        params: { counsellorID },
      }
    );
  }

  getEmployeebyID(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + '');
  }

  activeInActiveEmployeeStatusByID(
    id: any,
    isActive: boolean
  ): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + '/User/activeInActiveEmployeesByID', {
      params: { id, isActive },
    });
  }

  validateDayCareAssignment(centreID: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + '/User/validateDayCareAssignment', {
      params: { centreID }
    });
  }

  // POST
  EmployeeRole(EmployeeRoleForm: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.URL}/User/EmployeeRole`, EmployeeRoleForm);
  }
}
