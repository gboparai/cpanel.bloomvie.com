import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AddMasterActivityService {
  readonly rootUrl = environment.apiUrl
  constructor(private http: HttpClient) { }


  ManageActivity(ActivitiesBO: any): Observable<any> {
    return this.http.post<any>(this.rootUrl + '/Classroom/manageActivities', ActivitiesBO)
  }

  GetAllActivities(ActivityBO: any): Observable<any> {

    const requestBody = {
      isActive: ActivityBO.isActive,
      searchText: ActivityBO.searchText
    };
    return this.http.post<any>(this.rootUrl + "/Classroom/getAllActivities", requestBody)
  }

  GetActivityById(id: any): Observable<any> {
    return this.http.get<any>(this.rootUrl + "/Classroom/getActivitiesByID", { params: { id } })
  }

  ActiveInactiveById(id: any): Observable<any> {
    return this.http.get<any>(this.rootUrl + "/Classroom/activeInActiveMasterActivitiesByID", { params: { id } })
  }
}
