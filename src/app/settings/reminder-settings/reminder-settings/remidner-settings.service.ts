import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, ReminderSettingItem } from '../../../models/api.types';

@Injectable({
  providedIn: 'root',
})
export class RemidnerSettingsService {
  rootUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  addReminderSettings(ReminderSettingsB0: ReminderSettingItem | any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      this.rootUrl + '/Common/addReminderSettings',
      ReminderSettingsB0
    );
  }

  getReminderType(UserRoleID: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + '/Common/getReminderTypeByUserRoleID', {
      params: { UserRoleID },
    });
  }

  getAllReminderByCenterID(CentreID: number): Observable<ApiResponse<ReminderSettingItem[]>> {
    return this.http.get<ApiResponse<ReminderSettingItem[]>>(
      this.rootUrl + '/Common/getAllReminderByCenterID',
      { params: { CentreID } }
    );
  }
}
