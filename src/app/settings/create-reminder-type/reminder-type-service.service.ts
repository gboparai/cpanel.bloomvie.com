import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ReminderTypeServiceService {
  private readonly rootURL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  manageReminderTypes(ReminderTypeBO: Object): Observable<any> {
    return this.http.post<any>(
      this.rootURL + '/common/manageReminderTypes',
      ReminderTypeBO
    );
  }

  getAllReminderType(): Observable<any> {
    return this.http.get<any>(this.rootURL + '/common/getAllReminderTypeList');
  }

  activeInActiveReminderType(ID: number, isActive: boolean) {
    return this.http.put<any>(
      this.rootURL + '/common/activeInActiveReminderType',
      null,
      { params: { ID, isActive } }
    );
  }
}
