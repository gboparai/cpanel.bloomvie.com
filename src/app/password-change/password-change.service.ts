import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class PasswordChangeService {

  readonly URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  ResetPassword(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.URL + "/Login/resetPassword", data);
  }

  tokenCheck(token: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + "/Login/tokenMatch", { params: { token } });
  }
}
