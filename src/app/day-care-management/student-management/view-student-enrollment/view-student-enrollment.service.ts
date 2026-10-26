import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, ClassroomDropdownItem, DaycareSectionItem } from '../../../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class ViewStudentEnrollmentService {

  readonly URL = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getStudent(daycareID: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + "/DayCareCentreUser/getStudentsByDayCareID", { params: { daycareID } });
  }

  getStudentParentDetailsByStudentID(studentID: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + "/DayCareCentreUser/getStudentParentDetailsByStudentID", { params: { studentID } });
  }

  getClassList(centreID: any, ageGroupID: any): Observable<ApiResponse<ClassroomDropdownItem[]>> {
    return this.http.get<ApiResponse<ClassroomDropdownItem[]>>(this.URL + "/Classroom/getClassListDropdownByAgeGroup", { params: { centreID, ageGroupID } });
  }

  getSectionList(classID: any): Observable<ApiResponse<DaycareSectionItem[]>> {
    return this.http.get<ApiResponse<DaycareSectionItem[]>>(this.URL + "/Classroom/getSectionByClassID", { params: { classID } });
  }

  studentClassAssignment(studentData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.URL + "/DayCareCentreUser/studentClassAssignment", studentData);
  }

  assignTeacherForClass(TeacherBO: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.URL + "/DayCareCentreUser/assignTeacherForClass", TeacherBO);
  }
  getDayCarefortermsconditionsByCentreAdminID(id: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + "/DayCareCentreUser/getDayCarefortermsconditionsByCentreAdminID", { params: { id } });
  }
  getTeacherStatusbyId(Id: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + "/DayCareCentreUser/getTeacherStatusbyId", { params: { Id } });
  }
}
