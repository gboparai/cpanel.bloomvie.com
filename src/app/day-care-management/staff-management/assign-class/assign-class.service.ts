import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, ClassroomDropdownItem, DaycareDaysItem } from '../../../models/api.types';

@Injectable({
  providedIn: 'root',
})
export class AssignClassService {
  private readonly rootURL = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getDaycareClasses(ID: number): Observable<ApiResponse<ClassroomDropdownItem[]>> {
    return this.http.get<ApiResponse<ClassroomDropdownItem[]>>(
      this.rootURL + '/Classroom/getDaycareClassListDropdown',
      { params: { ID } }
    );
  }

  getAllAvailableTeachersByCentreID(
    ClassID: number,
    classTimings: any[]
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      this.rootURL + '/Classroom/getAllAvailableTeachersByCentreID',
      classTimings,
      { params: { ClassID } }
    );
  }

  getAllDays(): Observable<ApiResponse<DaycareDaysItem[]>> {
    return this.http.get<ApiResponse<DaycareDaysItem[]>>(this.rootURL + '/Classroom/getAllDays');
  }

  BulkClassAssignment(BulkTeacherAssignment: any[]): Observable<ApiResponse<any>> {
    const payload = {
      BulkTeacherAssignment: BulkTeacherAssignment,
      UserType: 'DayCare'
    };
    return this.http.post<ApiResponse<any>>(
      this.rootURL + '/Classroom/BulkClassAssignment',
      payload
    );
  }
}
