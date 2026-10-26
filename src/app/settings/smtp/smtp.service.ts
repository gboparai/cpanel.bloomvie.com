import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, SMTPSettingItem } from '../../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class SmtpService {
  readonly rootUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  ManageSMTP(SmtpBO: SMTPSettingItem | any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.rootUrl + '/Common/manageSMTPSettings', SmtpBO);
  }

  GetAllSMTPSettings(centreID: number): Observable<ApiResponse<SMTPSettingItem[]>> {
    return this.http.get<ApiResponse<SMTPSettingItem[]>>(this.rootUrl + '/Common/getAllSMTPSettings', { params: { centreID } });
  }

  GetSMTPSettingbyId(id: any): Observable<ApiResponse<SMTPSettingItem>> {
    return this.http.get<ApiResponse<SMTPSettingItem>>(this.rootUrl + '/Common/getSMTPsettingsbyId', { params: { id } });
  }

  ActiveInactiveSMTPSettingbyId(id: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + '/Common/activeInactiveSMTPSettingbyId', { params: { id } });
  }
}
