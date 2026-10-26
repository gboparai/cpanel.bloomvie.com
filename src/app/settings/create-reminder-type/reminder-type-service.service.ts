import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/api.types';

@Injectable({
  providedIn: 'root',
})
export class ReminderTypeServiceService {
  private readonly rootURL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  manageReminderTypes(ReminderTypeBO: Object): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      this.rootURL + '/common/manageReminderTypes',
      ReminderTypeBO
    );
  }

  getAllReminderType(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootURL + '/common/getAllReminderTypeList');
  }

  activeInActiveReminderType(ID: number, isActive: boolean): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      this.rootURL + '/common/activeInActiveReminderType',
      null,
      { params: { ID, isActive } }
    );
  }
}
