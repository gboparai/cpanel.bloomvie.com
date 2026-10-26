import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api.types';

@Injectable({
  providedIn: 'root',
})
export class AddBulkActivityService {
  readonly URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTeacherAssignments(teacherID: number, centreID: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + '/Centre/getTeacherAssignments', {
      params: { teacherID, centreID },
    });
  }

  getFoodType(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + '/Centre/getMealType');
  }

  getMealType(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + '/Centre/getFoodType');
  }

  downloadInvalidRecordsSheet(
    invalidRecords: any,
    centreID: number,
    teacherID: number
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      this.URL + '/Centre/DownloadInvalidActivityRecord',
      invalidRecords,
      { params: { centreID, teacherID } }
    );
  }
}
