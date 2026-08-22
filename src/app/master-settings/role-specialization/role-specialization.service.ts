import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleSpecializationService {
  readonly rootUrl = environment.apiUrl

  constructor(private http:HttpClient) { }

  ManageRoleSpecialization(MasterRoleSpecializationBO: any):Observable<any>{
    return this.http.post<any>(this.rootUrl + "/Centre/manageRoleSpecialization", MasterRoleSpecializationBO)
  }
  
  getRoleSpecializationByID(ID: any): Observable<any> {
    return this.http.get<any>(this.rootUrl + "/Centre/getRoleSpecializationByID", { params: { ID } })
  }

  activeInactiveRoleSpecialization(ID: any): Observable<any> {
    return this.http.get<any>(this.rootUrl + "/Centre/activeInactiveRoleSpecialization", { params: { ID } })
  }

  getAllRoleSpecializations():Observable<any>{
    return this.http.get<any>(this.rootUrl+'/Centre/getAllRoleSpecializations');
  }
}
