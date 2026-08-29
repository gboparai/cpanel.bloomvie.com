import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AssignUserPermissionService {
  readonly URL = environment.apiUrl;
  public UserRole = '/User/getAllUserRoles';
  //public viewEmployeeRole='User/getEmployeeRole'
  //public EmployeeRoleForm='/User/EmployeeRole'

  constructor(private http: HttpClient) {}

  // GET
  getUserRole(): Observable<any> {
    return this.http.get(this.URL + this.UserRole);
  }

  getDayCare(type:any): Observable<any> {
    return this.http.get(this.URL + '/Centre/getAllCentre', {params: { type }});
  }

  getEmployeeRole(userRoleId: any, isActive: any): Observable<any> {
    return this.http.get(this.URL + '/User/getEmployeeRole', {
      params: { userRoleId, isActive },
    });
  }

  getassignedDcc(counsellorID: any): Observable<any> {
    return this.http.get(
      this.URL + '/DayCareCentreUser/getAssignedDccForCounsellor',
      {
        params: { counsellorID },
      }
    );
  }

  getEmployeebyID(): Observable<any> {
    return this.http.get(this.URL + '');
  }

  activeInActiveEmployeeStatusByID(
    id: any,
    isActive: boolean
  ): Observable<any> {
    return this.http.get<any>(this.URL + '/User/activeInActiveEmployeesByID', {
      params: { id, isActive },
    });
  }

  validateDayCareAssignment(centreID:any):Observable<any>{
    return this.http.get<any>(this.URL+'/User/validateDayCareAssignment',{
      params:{centreID}
    })

  }

  // POST

  EmployeeRole(EmployeeRoleForm: any): Observable<any> {
    return this.http.post<any>(`${this.URL}/User/EmployeeRole`, EmployeeRoleForm);
  }

  
  
}
