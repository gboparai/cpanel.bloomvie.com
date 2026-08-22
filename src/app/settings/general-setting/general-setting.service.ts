import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';
import { Observable } from 'rxjs';
import { parseArgs } from 'util';

@Injectable({
  providedIn: 'root',
})
export class GeneralSettingService {
  private readonly rootUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  assignEntitiesToCenter(postData: any, centreId: number): Observable<any> {
    return this.http.post<any>(
      this.rootUrl + '/Centre/assignEntitiesToCenter',
      postData,
      { params: { centreId } }
    );
  }
  getEntitiesByCenter(centreId: number): Observable<any> {
    return this.http.get<any>(this.rootUrl + '/Centre/getEntitiesByCenter', {
      params: { centreId },
    });
  }

  manageMasterActivites(ActivitiesBO: any): Observable<any> {
    return this.http.post<any>(
      this.rootUrl + '/classroom/manageMasterActivites',
      ActivitiesBO
    );
  }


  getAllAgeGroupsByUserID(userid:any): Observable<any> {
    return this.http.get<any>(this.rootUrl + "/Centre/getAllAgeGroupsByUserID",{params: {userid}})
  }

  getAllFacilityByUserId(userid:any):Observable<any>
  {
    return this.http.get<any>(this.rootUrl+"/Common/getAllFacilityByUserId",{params: {userid}});
  }

  getAllActivitiesByUserId(userid: any): Observable<any> {
    return this.http.get<any>(this.rootUrl + "/Classroom/getAllActivitiesByUserId", {params: {userid}});
  }

}
