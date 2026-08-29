import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AddAgeGroupService {
  readonly rootUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  ManageAgeGroup(MasterAgeGroupsBO: any): Observable<any> {
    return this.http.post<any>(
      this.rootUrl + '/Centre/manageAgeGroup',
      MasterAgeGroupsBO
    );
  }

  GetAgeGroupByID(ID: any): Observable<any> {
    return this.http.get<any>(this.rootUrl + '/Centre/getAgeGroupByID', {
      params: { ID },
    });
  }

  ActiveInactiveAgeGroup(ID: any): Observable<any> {
    return this.http.get<any>(this.rootUrl + '/Centre/activeInactiveAgeGroup', {
      params: { ID },
    });
  }

  GetAllAgeGroup(): Observable<any> {
    return this.http.get<any>(this.rootUrl + '/Centre/getAllAgeGroups');
  }
}
