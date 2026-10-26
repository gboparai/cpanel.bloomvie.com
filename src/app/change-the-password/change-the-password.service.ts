import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PasswordChangeItem } from '../models/api.types';

@Injectable({
  providedIn: 'root',
})
export class ChangeThePasswordService {
  rootUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  managePasswordChange(passwordChangeBO: PasswordChangeItem | any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      this.rootUrl + '/Common/managePasswordChange',
      passwordChangeBO
    );
  }
}
