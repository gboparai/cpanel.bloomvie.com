import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, MasterActivityItem } from '../../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class AddMasterActivityService {
  readonly rootUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  ManageActivity(ActivitiesBO: MasterActivityItem | any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.rootUrl + '/Classroom/manageActivities', ActivitiesBO);
  }

  GetAllActivities(ActivityBO: any): Observable<ApiResponse<MasterActivityItem[]>> {
    const requestBody = {
      isActive: ActivityBO.isActive,
      searchText: ActivityBO.searchText
    };
    return this.http.post<ApiResponse<MasterActivityItem[]>>(this.rootUrl + "/Classroom/getAllActivities", requestBody);
  }

  GetActivityById(id: any): Observable<ApiResponse<MasterActivityItem>> {
    return this.http.get<ApiResponse<MasterActivityItem>>(this.rootUrl + "/Classroom/getActivitiesByID", { params: { id } });
  }

  ActiveInactiveById(id: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + "/Classroom/activeInActiveMasterActivitiesByID", { params: { id } });
  }
}
