import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class AssignClassService {
  private readonly rootURL = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getDaycareClasses(ID: number): Observable<any> {
    return this.http.get<{ id: number; name: string }>(
      this.rootURL + '/Classroom/getDaycareClassListDropdown',
      { params: { ID } }
    );
  }

  getAllAvailableTeachersByCentreID(
    ClassID: number,
    classTimings: any[]
  ): Observable<any> {
    return this.http.post<any>(
      this.rootURL + '/Classroom/getAllAvailableTeachersByCentreID',
      classTimings,
      { params: { ClassID } }
    );
  }

  getAllDays(): Observable<any> {
    return this.http.get<any>(this.rootURL + '/Classroom/getAllDays');
  }

  BulkClassAssignment(BulkTeacherAssignment: any[]): Observable<any> {
    const payload = {
      BulkTeacherAssignment: BulkTeacherAssignment,
      UserType: 'DayCare'
    };
    return this.http.post<any>(
      this.rootURL + '/Classroom/BulkClassAssignment',
      payload
    );
  }
}
