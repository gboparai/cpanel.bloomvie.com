import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApplicationsSettingsService {
  readonly rootUrl = environment.apiUrl;
  breadcrumbSubject = new BehaviorSubject<string>('');

  breadcrumb$ = this.breadcrumbSubject.asObservable();
  constructor(private httpClient: HttpClient) { }


  // changeFavicon(iconUrl: string) {
  //   const head = document.head || document.getElementsByTagName('head')[0];
  //   const favicon = this.getOrCreateFavicon();
  //   favicon.href = iconUrl;
  //   head.appendChild(favicon);
  // }

  // private getOrCreateFavicon(): HTMLLinkElement {
  //   let favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;
  //   if (!favicon) {
  //     favicon = document.createElement('link');
  //     favicon.rel = 'icon';
  //     document.head.appendChild(favicon);
  //   }
  //   return favicon;
  // }


  // private dataSource=new Subject<any>();
  // data$=this.dataSource.asObservable();

  // sendData(data:{key:any,value:any}){
  //   this.dataSource.next(data);
  // }
  setImage(breadcrumb: string) {
    this.breadcrumbSubject.next(breadcrumb);
  }

  ManageApplicationSettings(ApplicationSettingBO: any): Observable<any> {
    return this.httpClient.post<any>(this.rootUrl + '/Common/manageApplicationSettings', ApplicationSettingBO)
  }

  GetApplicationSetting(): Observable<any> {

    return this.httpClient.get<any>(this.rootUrl + '/Common/getApplicationSetting')
  }


  GetNofications(userID: any): Observable<any> {
    return this.httpClient.get<any>(this.rootUrl + '/SlotTimeTable/getAllNotification', { params: { userID } })
  }

  AppintmentIsRead(obj: any[]): Observable<any> {
    return this.httpClient.post<any>(`${this.rootUrl}/SlotTimeTable/manageNotificationAssignment`, obj);
  }

  uploadImages(formData: FormData, type: string): Observable<any> {
    return this.httpClient.post<any>(`${this.rootUrl}/Common/uploadImages`, formData, { params: { type } });
  }

  UploadBulkActivitesOfStudent(model: any): Observable<any> {
    return this.httpClient.post(`${this.rootUrl}/Classroom/UploadBulkActivitesOfStudent`, model);
  }

}
