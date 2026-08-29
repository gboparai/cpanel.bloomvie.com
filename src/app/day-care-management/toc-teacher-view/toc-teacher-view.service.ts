import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TocTeacherViewService {
  private readonly rootUrl: string = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getALlTocApprovedTeacher(CentreID: number): Observable<any> {
    return this.http.get<any>(
      `${this.rootUrl}/Frontend/getAcceptedTocTeacherByCentreID`,
      { params: { CentreID } }
    );
  }

  getAllClassesByTimings(classTimingsBO: any): Observable<any> {
    return this.http.post<any>(
      `${this.rootUrl}/frontend/getAllClassesByTimings`,
      classTimingsBO
    );
  }

  getAllDays(): Observable<any> {
    return this.http.get<any>(`${this.rootUrl}/Classroom/getAllDays`);
  }
}
