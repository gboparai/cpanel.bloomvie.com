import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse, SocialLinkItem } from '../../../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class SocialLinksService {
  private readonly rootURL: string = environment.apiUrl;
  constructor(private http: HttpClient) { }

  manageDaycareSocailLinks(postData: SocialLinkItem | any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.rootURL + '/Centre/manageDaycareSocialLinks', postData);
  }
  getSocialMediaLinks(dayCareID: number): Observable<ApiResponse<SocialLinkItem>> {
    return this.http.get<ApiResponse<SocialLinkItem>>(this.rootURL + '/Centre/socialMediaLinks', { params: { dayCareID } });
  }

  managePayrollFrequency(postData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.rootURL + '/DayCareCentreUser/manageDayCareCentrePayrollFrequency', postData);
  }

  getPayrollFrequencyByDaycareID(centreID: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootURL + '/Centre/getPayrollFrequencyByDaycareID', { params: { centreID } });
  }
}
