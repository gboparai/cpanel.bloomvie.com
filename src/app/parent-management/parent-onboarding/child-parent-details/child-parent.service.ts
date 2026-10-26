import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse, MasterAgeGroupItem } from '../../../models/api.types';

@Injectable({
  providedIn: 'root',
})
export class ChildParentService {
  readonly URL = environment.apiUrl;
  constructor(private http: HttpClient) {}
  CheckInterestedMobileExist(mobile: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + '/User/CheckInterestedMobileExist', {
      params: { mobile },
    });
  }
  manageDetail(basicDetailForm: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      this.URL + '/DayCareCentreUser/parentStudent',
      basicDetailForm
    );
  }

  GetAllAgeGroup(CentreID: number): Observable<ApiResponse<MasterAgeGroupItem[]>> {
    return this.http.get<ApiResponse<MasterAgeGroupItem[]>>(this.URL + '/Centre/getAllAgeGroupByCentreID', {
      params: { CentreID },
    });
  }

  getLocationData(postalCode: string): Observable<any> {
    const url = `http://api.zippopotam.us/CA/${postalCode.replace(/\s+/g, '')}`;
    return this.http.get<any>(url);
  }

  getStudentParentDetailsByParentID(
    parentID: number,
    studentID: number
  ): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      this.URL + '/DayCareCentreUser/getStudentParentDetailsByParentID',
      { params: { parentID, studentID } }
    );
  }

  getStudentLikesAndDislikes(parentID: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      this.URL + '/DayCareCentreUser/getStudentLikesAndDislikes',
      { params: { parentID } }
    );
  }
}
