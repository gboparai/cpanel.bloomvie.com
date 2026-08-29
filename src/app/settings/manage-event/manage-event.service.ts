import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ManageEventService {

  private rootURL:string = environment.apiUrl

constructor(private http:HttpClient){}


manageMasterEvent(data: any): Observable<any> {
  return this.http.post<any>(this.rootURL + '/Common/manageMasterEvent', data);
}



getMasterEvent(userID:any, UserRoleID:any, type:any): Observable<any> {
  return this.http.get<any>(this.rootURL + '/Common/getMasterEvent', { params: { userID, UserRoleID, type } });
}


activeInActiveEventID(id:any):Observable<any>{
  return this.http.get<any>(this.rootURL + '/Common/activeInActiveEventID', { params: { id } });

}


}
