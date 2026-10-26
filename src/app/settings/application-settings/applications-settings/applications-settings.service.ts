import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ApiResponse, ApplicationSettingItem } from '../../../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class ApplicationsSettingsService {
  readonly rootUrl = environment.apiUrl;
  breadcrumbSubject = new BehaviorSubject<string>('');

  breadcrumb$ = this.breadcrumbSubject.asObservable();
  constructor(private httpClient: HttpClient) { }

  setImage(breadcrumb: string) {
    this.breadcrumbSubject.next(breadcrumb);
  }

  ManageApplicationSettings(ApplicationSettingBO: ApplicationSettingItem | any): Observable<ApiResponse<any>> {
    return this.httpClient.post<ApiResponse<any>>(this.rootUrl + '/Common/manageApplicationSettings', ApplicationSettingBO);
  }

  GetApplicationSetting(): Observable<ApiResponse<ApplicationSettingItem>> {
    return this.httpClient.get<ApiResponse<ApplicationSettingItem>>(this.rootUrl + '/Common/getApplicationSetting');
  }

  GetNofications(userID: any): Observable<ApiResponse<any>> {
    return this.httpClient.get<ApiResponse<any>>(this.rootUrl + '/SlotTimeTable/getAllNotification', { params: { userID } });
  }

  AppintmentIsRead(obj: any[]): Observable<ApiResponse<any>> {
    return this.httpClient.post<ApiResponse<any>>(`${this.rootUrl}/SlotTimeTable/manageNotificationAssignment`, obj);
  }

  uploadImages(formData: FormData, type: string): Observable<ApiResponse<any>> {
    return this.httpClient.post<ApiResponse<any>>(`${this.rootUrl}/Common/uploadImages`, formData, { params: { type } });
  }

  UploadBulkActivitesOfStudent(model: any): Observable<ApiResponse<any>> {
    return this.httpClient.post<ApiResponse<any>>(`${this.rootUrl}/Classroom/UploadBulkActivitesOfStudent`, model);
  }
}
