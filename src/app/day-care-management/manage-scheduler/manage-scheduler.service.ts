import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse, ClassroomDropdownItem, DaycareDaysItem } from '../../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class ManageSchedulerService {
  private readonly rootURL: string = environment.apiUrl;
  constructor(private http: HttpClient) { }
  
  getDaycareClasses(ID: number): Observable<ApiResponse<ClassroomDropdownItem[]>> {
    return this.http.get<ApiResponse<ClassroomDropdownItem[]>>(this.rootURL + '/Classroom/getDaycareClassListDropdown', { params: { ID } });
  }

  GetAllDays(): Observable<ApiResponse<DaycareDaysItem[]>> {
    return this.http.get<ApiResponse<DaycareDaysItem[]>>(this.rootURL + "/Classroom/getAllDays");
  }

  getCentreWorkingDaysByCentreID(centreID: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootURL + '/Centre/getCentreWorkingDaysByCentreID', { params: { centreID } });
  }

  getAllAvailableTeachersByCentreID(ClassID: number, classTimings: any[], Type: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.rootURL + '/Classroom/getAllAvailableTeachersByCentreIDUsingType', classTimings, { params: { ClassID, Type } });
  }

  BulkClassAssignment(BulkTeacherAssignment: any[], userType: string): Observable<ApiResponse<any>> {
    const body = {
      BulkTeacherAssignment: BulkTeacherAssignment,
      userType: userType
    };
    return this.http.post<ApiResponse<any>>(`${this.rootURL}/Classroom/BulkClassAssignment`, body);
  }
}
