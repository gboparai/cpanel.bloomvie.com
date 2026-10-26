import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class CounsellorDashboardService {

  public rootURL = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getTodaysMeetings(CounsellorID: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootURL + '/Dashboard/getTodaysMeetings', { params: { CounsellorID } });
  }

  getCounsellorDashboardCount(counsellorID: number, TimeZone: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootURL + '/Dashboard/getCounsellorDashboardCount', { params: { counsellorID, TimeZone } });
  }
}
