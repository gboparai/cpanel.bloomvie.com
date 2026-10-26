import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, DaycareSectionItem, StudentGalleryItem } from '../../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class ManageStudentGalleryService {
  readonly rootUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getClassRoomByTeacherID(teacherId: any, userRoleId: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + "/Classroom/getClassRoomByTeacherID", { params: { teacherId, userRoleId } });
  }

  getStudentBySectionID(sectionId: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + "/DayCareCentreUser/getStudentBySectionID", { params: { sectionId } });
  }

  getSectionByClassID(classID: any): Observable<ApiResponse<DaycareSectionItem[]>> {
    return this.http.get<ApiResponse<DaycareSectionItem[]>>(this.rootUrl + "/Classroom/getSectionByClassID", { params: { classID } });
  }

  dayCareCentreStudentGallery(obj: StudentGalleryItem | any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.rootUrl + "/DayCareCentreUser/dayCareCentreStudentGallery", obj);
  }

  getStudentByParentID(parentID: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + "/DayCareCentreUser/getStudentByParentID", { params: { parentID } });
  }

  getStudentGalleryByStudentID(studentID: any, startDate: any, endDate: any): Observable<ApiResponse<StudentGalleryItem[]>> {
    return this.http.get<ApiResponse<StudentGalleryItem[]>>(this.rootUrl + "/DayCareCentreUser/getStudentGalleryByStudentID", { params: { studentID, startDate, endDate } });
  }

  studentGalleryDelete(galleryID: any, filePath: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + "/DayCareCentreUser/studentGalleryDelete", { params: { galleryID, filePath } });
  }

  ManageComment(ID: any, comment: any, action: any, date: any, type: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + "/DayCareCentreUser/ManageComment", { params: { ID, comment, action, date, type } });
  }

  GetComment(ID: any, date: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + "/DayCareCentreUser/GetComment", { params: { ID, date } });
  }

  getParentDetails(studentID: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + "/DayCareCentreUser/getParentDetailStudentID", { params: { studentID } });
  }

  getTeacherDetailByParentID(parentID: any, studentID: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + "/DayCareCentreUser/getTeacherDetailByParentID", { params: { parentID, studentID } });
  }
}
