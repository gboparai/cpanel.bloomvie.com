import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ManageStudentGalleryService {
  getStudentDetails(studentID: any, startDate: any, endDate: any) {
    throw new Error('Method not implemented.');
  }
  readonly rootUrl = environment.apiUrl
  constructor(private http: HttpClient) { }

  getClassRoomByTeacherID(teacherId: any, userRoleId:any): Observable<any> {
    return this.http.get<any>(this.rootUrl + "/Classroom/getClassRoomByTeacherID", {params:{teacherId, userRoleId}})
  }

  

  getStudentBySectionID(sectionId: any): Observable<any> {
    return this.http.get<any>(this.rootUrl + "/DayCareCentreUser/getStudentBySectionID", {params:{sectionId}});
  }


  getSectionByClassID(classID: any): Observable<any> {
    return this.http.get<any>(this.rootUrl + "/Classroom/getSectionByClassID", {params:{classID}} )
  }


  dayCareCentreStudentGallery(obj:any):Observable<any>{
    return this.http.post<any>(this.rootUrl +  "/DayCareCentreUser/dayCareCentreStudentGallery", obj)
  }


  getStudentByParentID(parentID: any): Observable<any> {
    return this.http.get<any>(this.rootUrl + "/DayCareCentreUser/getStudentByParentID", {params:{parentID}} )
  }

  getStudentGalleryByStudentID(studentID: any, startDate:any, endDate: any): Observable<any> {
    return this.http.get<any>(this.rootUrl + "/DayCareCentreUser/getStudentGalleryByStudentID", {params:{studentID, startDate, endDate}} )
  }

  studentGalleryDelete(galleryID:any, filePath:any): Observable<any> {
    return this.http.get<any>(this.rootUrl + "/DayCareCentreUser/studentGalleryDelete",  {params:{galleryID, filePath}})
  }


  ManageComment(ID:any, comment:any, action:any, date:any, type:any): Observable<any> {
    return this.http.get<any>(this.rootUrl + "/DayCareCentreUser/ManageComment",  {params:{ID, comment, action, date, type}})
  }


  GetComment(ID:any,date:any): Observable<any> {
    return this.http.get<any>(this.rootUrl + "/DayCareCentreUser/GetComment",  {params:{ID, date}})
  }

  getParentDetails(studentID:any): Observable<any> {
    return this.http.get<any>(this.rootUrl + "/DayCareCentreUser/getParentDetailStudentID",  {params:{studentID}})
  }


  getTeacherDetailByParentID(parentID:any, studentID:any): Observable<any> {
    return this.http.get<any>(this.rootUrl + "/DayCareCentreUser/getTeacherDetailByParentID",  {params:{parentID, studentID}})
  }

}
