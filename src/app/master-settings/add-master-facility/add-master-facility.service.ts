import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class AddMasterFacilityService {
  readonly rootUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  ManageFacility(MasterFacilitiesBO: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.rootUrl + "/Centre/manageFacilities", MasterFacilitiesBO);
  }

  GetAllFacilities(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + "/Common/getAllFacility");
  }

  GetFacilityById(id: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + "/Centre/getFacilitiesByID", { params: { id } });
  }

  ActiveInactiveFacilityId(id: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + "/Centre/activeInactiveFacilityByID", { params: { id } });
  }
}
