import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PasswordChangeService {

  readonly URL = environment.apiUrl

  constructor(private http: HttpClient) {}

  ResetPassword(data : any):Observable<any>{
    return this.http.post(this.URL + "/Login/resetPassword",data);
  }

  tokenCheck(token : any):Observable<any>{
    return this.http.get(this.URL + "/Login/tokenMatch",{params:{token}});
  }
  
}
