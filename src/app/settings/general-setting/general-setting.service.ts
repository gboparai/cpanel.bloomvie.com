import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse, MasterActivityItem, MasterAgeGroupItem } from '../../models/api.types';

@Injectable({
  providedIn: 'root',
})
export class GeneralSettingService {
  private readonly rootUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  assignEntitiesToCenter(postData: any, centreId: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      this.rootUrl + '/Centre/assignEntitiesToCenter',
      postData,
      { params: { centreId } }
    );
  }
  getEntitiesByCenter(centreId: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + '/Centre/getEntitiesByCenter', {
      params: { centreId },
    });
  }

  manageMasterActivites(ActivitiesBO: MasterActivityItem | any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      this.rootUrl + '/classroom/manageMasterActivites',
      ActivitiesBO
    );
  }

  getAllAgeGroupsByUserID(userid: any): Observable<ApiResponse<MasterAgeGroupItem[]>> {
    return this.http.get<ApiResponse<MasterAgeGroupItem[]>>(this.rootUrl + "/Centre/getAllAgeGroupsByUserID", { params: { userid } });
  }

  getAllFacilityByUserId(userid: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + "/Common/getAllFacilityByUserId", { params: { userid } });
  }

  getAllActivitiesByUserId(userid: any): Observable<ApiResponse<MasterActivityItem[]>> {
    return this.http.get<ApiResponse<MasterActivityItem[]>>(this.rootUrl + "/Classroom/getAllActivitiesByUserId", { params: { userid } });
  }
}
