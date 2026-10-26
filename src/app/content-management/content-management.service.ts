import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class ContentManagementService {
  private readonly rootUrl: string = environment.apiUrl;
  pagename: any = "";
  private data = new BehaviorSubject<any>(null);
  public currentdata = this.data.asObservable();
  constructor(private http: HttpClient) { }

  GetHomePageSection(Type: any, UserID: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + '/ContentManagement/getHomePageSectionByTypeName', { params: { Type, UserID } });
  }

  GetSectionListBySectionAndTypeName(bo: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.rootUrl + '/ContentManagement/getContentBySectionAndTypeName', bo);
  }

  getDayCareCentreContentMaster(bo: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.rootUrl + '/ContentManagement/getDayCareCentreContentMaster', bo);
  }

  manageContent(blogContentBO: any): Observable<ApiResponse<any>> { 
    return this.http.post<ApiResponse<any>>(this.rootUrl + '/ContentManagement/manageContent', blogContentBO);
  }

  getFrontentContentByType(Type: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + '/ContentManagement/getFrontentContentByType', { params: { Type } });
  }

  ActiveInactiveContent(id: number, type: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + '/ContentManagement/activeInactiveContentManageMent', { params: { id, type } });
  }

  AddHomePageImages(formdata: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.rootUrl + '/UploadMultipleFiles', formdata);
  }

  dayCareCentreContentMaster(ContentBo: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.rootUrl + '/ContentManagement/dayCareCentreContentMaster', ContentBo);
  }

  PassData(val: any) {
    this.data.next(val);
  }

  DaycareGalleryDelete(ContentMasterID: any, ImagePath: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + '/ContentManagement/daycareGalleryDelete', { params: { ContentMasterID, ImagePath } });
  }

  getDayCareGallery(id: any, type: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + '/ContentManagement/getDayCareGallery', { params: { id, type } });
  }
}
