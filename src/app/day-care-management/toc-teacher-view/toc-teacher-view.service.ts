import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, DaycareDaysItem } from '../../models/api.types';

@Injectable({
  providedIn: 'root',
})
export class TocTeacherViewService {
  private readonly rootUrl: string = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getALlTocApprovedTeacher(CentreID: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.rootUrl}/Frontend/getAcceptedTocTeacherByCentreID`,
      { params: { CentreID } }
    );
  }

  getAllClassesByTimings(classTimingsBO: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.rootUrl}/frontend/getAllClassesByTimings`,
      classTimingsBO
    );
  }

  getAllDays(): Observable<ApiResponse<DaycareDaysItem[]>> {
    return this.http.get<ApiResponse<DaycareDaysItem[]>>(`${this.rootUrl}/Classroom/getAllDays`);
  }
}
