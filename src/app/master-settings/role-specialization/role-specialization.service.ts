import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse, MasterRoleSpecializationItem } from '../../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class RoleSpecializationService {
  readonly rootUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  ManageRoleSpecialization(MasterRoleSpecializationBO: MasterRoleSpecializationItem | any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.rootUrl + "/Centre/manageRoleSpecialization", MasterRoleSpecializationBO);
  }
  
  getRoleSpecializationByID(ID: any): Observable<ApiResponse<MasterRoleSpecializationItem>> {
    return this.http.get<ApiResponse<MasterRoleSpecializationItem>>(this.rootUrl + "/Centre/getRoleSpecializationByID", { params: { ID } });
  }

  activeInactiveRoleSpecialization(ID: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + "/Centre/activeInactiveRoleSpecialization", { params: { ID } });
  }

  getAllRoleSpecializations(): Observable<ApiResponse<MasterRoleSpecializationItem[]>> {
    return this.http.get<ApiResponse<MasterRoleSpecializationItem[]>>(this.rootUrl + '/Centre/getAllRoleSpecializations');
  }
}
