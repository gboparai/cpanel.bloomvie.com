import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserRoleService {
  readonly rootUrl= environment.apiUrl
  constructor(private http:HttpClient) { }

  ManageUserRole(UserRolesBO:any):Observable<any>{
    
    return this.http.post<any>(this.rootUrl+'/User/manageUserRole',UserRolesBO)
  }

 getAllUserRoles():Observable<any>{
  
  return this.http.get<any>(this.rootUrl+'/User/getAllUserRoles')
 }

 activeInActiveUserRoleByID(Id:any):Observable<any>{
  return this.http.get<any>(this.rootUrl+'/User/activeInActiveUserRoleByID',{params:{Id}})
 }

 getUserRolesByID(id :any):Observable<any>{
  
  return this.http.get<any>(this.rootUrl+'/User/getUserRolesByID',{params:{id}})
 }

 userRoleRelation(dataObject:any):Observable<any>{
  
  return this.http.post<any>(this.rootUrl+'/User/userRoleRelation',dataObject);
 }
}
