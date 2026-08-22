import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AddBulkActivityService {
  readonly URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTeacherAssignments(teacherID: number, centreID: number): Observable<any> {
    return this.http.get<any>(this.URL + '/Centre/getTeacherAssignments', {
      params: { teacherID, centreID },
    });
  }

  getFoodType(): Observable<any> {
    return this.http.get<any>(this.URL + '/Centre/getMealType');
  }

  getMealType(): Observable<any> {
    return this.http.get<any>(this.URL + '/Centre/getFoodType');
  }

  downloadInvalidRecordsSheet(
    invalidRecords: any,
    centreID: number,
    teacherID: number
  ): Observable<any> {
    return this.http.post<any>(
      this.URL + '/Centre/DownloadInvalidActivityRecord',
      invalidRecords,
      { params: { centreID, teacherID } }
    );
  }
}
