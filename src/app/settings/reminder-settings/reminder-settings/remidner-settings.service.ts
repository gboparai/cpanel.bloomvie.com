import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RemidnerSettingsService {
  rootUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  addReminderSettings(ReminderSettingsB0: any): Observable<any> {
    return this.http.post(
      this.rootUrl + '/Common/addReminderSettings',
      ReminderSettingsB0
    );
  }

  getReminderType(UserRoleID: number): Observable<any> {
    return this.http.get(this.rootUrl + '/Common/getReminderTypeByUserRoleID', {
      params: { UserRoleID },
    });
  }

  getAllReminderByCenterID(CentreID: number): Observable<any> {
    return this.http.get<any>(
      this.rootUrl + '/Common/getAllReminderByCenterID',
      { params: { CentreID } }
    );
  }
}
