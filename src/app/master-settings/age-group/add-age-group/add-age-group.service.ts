import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, MasterAgeGroupItem } from '../../../models/api.types';

@Injectable({
  providedIn: 'root',
})
export class AddAgeGroupService {
  readonly rootUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  ManageAgeGroup(MasterAgeGroupsBO: MasterAgeGroupItem | any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      this.rootUrl + '/Centre/manageAgeGroup',
      MasterAgeGroupsBO
    );
  }

  GetAgeGroupByID(ID: any): Observable<ApiResponse<MasterAgeGroupItem>> {
    return this.http.get<ApiResponse<MasterAgeGroupItem>>(this.rootUrl + '/Centre/getAgeGroupByID', {
      params: { ID },
    });
  }

  ActiveInactiveAgeGroup(ID: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + '/Centre/activeInactiveAgeGroup', {
      params: { ID },
    });
  }

  GetAllAgeGroup(): Observable<ApiResponse<MasterAgeGroupItem[]>> {
    return this.http.get<ApiResponse<MasterAgeGroupItem[]>>(this.rootUrl + '/Centre/getAllAgeGroups');
  }
}
