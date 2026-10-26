import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ApiResponse,
  AddStaffRequest,
  StaffInfo,
  StaffListResponse,
  ClassroomDropdownItem,
} from '../../../models/api.types';

@Injectable({
  providedIn: 'root',
})
export class ManageStaffService {
  private readonly rootURL: string = environment.apiUrl;
  constructor(private http: HttpClient) {}
  getStaffAccToNameAndEmailSearch(NameOrEmail: number | string, centreID: number): Observable<ApiResponse<StaffInfo[]>> {
    return this.http.get<ApiResponse<StaffInfo[]>>(
      this.rootURL + '/DayCareCentreUser/getStaffAccToNameAndEmailSearch',
      { params: { NameOrEmail, centreID } }
    );
  }

  getCentreStaffList(centreID: number, NameOrEmail: any, type: any, IsOnlystaff: boolean): Observable<StaffListResponse> {
    return this.http.get<StaffListResponse>(this.rootURL + '/DayCareCentreUser/getCentreStaffList', { params: { centreID, NameOrEmail, type, IsOnlystaff } });
  }

  // getClassListByTeacherID(id: number): Observable<any> {
  //   return this.http.get<any>(
  //     this.rootURL + '/Classroom/getClassListByTeacherID',
  //     { params: { id } }
  //   );
  // }

  //Added on 28/04/25
  getClassListByTeacherID(id: number,centreId:number): Observable<any> {
    return this.http.get<any>(this.rootURL + '/Classroom/getClassListByTeacher&CentreID',{ params: { id ,centreId} }
    );
  }


  getClassListByuserRoleID(id: number,centreId:number,userRoleId:number): Observable<any> {
    return this.http.get<any>(this.rootURL + '/Classroom/getClassListByuserRoleID',{ params: { id ,centreId,userRoleId} }
    );
  }

  getDaycareClasses(ID: number): Observable<ApiResponse<ClassroomDropdownItem[]>> {
    return this.http.get<ApiResponse<ClassroomDropdownItem[]>>(
      this.rootURL + '/Classroom/getDaycareClassListDropdown',
      { params: { ID } }
    );
  }
  getDaycareClassSections(ID: number): Observable<any> {
    return this.http.get<ApiResponse<ClassroomDropdownItem[]>>(
      this.rootURL + '/Classroom/getDaycareClassSectionListDropdown',
      { params: { ID } }
    );
  }
  manageStaff(postData: AddStaffRequest, CreatedByRoleID: number): Observable<ApiResponse<any>> {
    return this.http.post<any>(
      this.rootURL + '/DayCareCentreUser/ManageStaffAsync',
      postData,
      { params: { CreatedByRoleID } }
    );
  }

  activeInactiveStaff(ID: number): Observable<any> {
    return this.http.get<any>(
      this.rootURL + '/DayCareCentreUser/activeInactiveCentreUser',
      { params: { ID } }
    );
  }
  getRoleSpecializationList(ID: number): Observable<any> {
    return this.http.get<any>(
      this.rootURL + '/DayCareCentreUser/getRoleSpecializationList',
      { params: { ID } }
    );
  }
  downloadBulkUploadSheetFormat(centreId: number): Observable<any> {
    return this.http.get<any>(
      this.rootURL + '/DayCareCentreUser/downloadBulkUploadSheetForStaff',
      { params: { centreId } }
    );
  }

  downloadBulkUploadSheetForActivites(
    centreID: any,
    teacherID: any
  ): Observable<any> {
    return this.http.get(
      this.rootURL + '/Centre/downloadBulkUploadSheetForActivites',
      { params: { centreID, teacherID } }
    );
  }
  uploadBulkStaff(postData: FormData | any, centreID: number): Observable<ApiResponse<any>> {
    return this.http.post<any>(
      this.rootURL + '/DayCareCentreUser/uploadBulkStaff',
      postData,
      { params: { centreID } }
    );
  }

  isClassOrSectionAssigned(
    classID: number,
    teacherID: number
  ): Observable<any> {
  
    return this.http.get<any>(
      this.rootURL + '/DayCareCentreUser/isClassOrSectionAssigned',
      { params: { classID, teacherID } }
    );
  }

  assignedClassToNewTeacher(
    oldTeacherID: number,
    newTeacherID: number,
    Type: string
  ): Observable<any> {
   
    return this.http.put<any>(
      this.rootURL + '/Classroom/assignedClassToNewTeacher',
      null,
      { params: { oldTeacherID, newTeacherID, Type } }
    );
  }

  TeacherClassSectionAssignment(teacherID: any, classID: any): Observable<any> {
 
    return this.http.put<any>(
      this.rootURL + '/Classroom/TeacherClassSectionAssignment',
      null,
      { params: { teacherID, classID } }
    );
  }

  getAllTeachersNameByCentreID(
    centreID: number,
    teacherID: number
  ): Observable<any> {
   
    return this.http.get<any>(
      this.rootURL + '/Classroom/getAllTeachersNameByCentreID',
      { params: { centreID, teacherID } }
    );
  }

  getAllClassesByTeacherID(teacherID: number): Observable<any> {
    
    return this.http.get<any>(
      this.rootURL + '/Classroom/getAllClassesByTeacherID',
      { params: { teacherID } }
    );
  }

  checkClassAlreadyAssignOrNot(
    oldTeacherID: number,
    newTeacherID: number
  ): Observable<any> {
    
    return this.http.get<any>(
      this.rootURL + '/Classroom/checkClassAlreadyAssignOrNot',
      { params: { oldTeacherID, newTeacherID } }
    );
  }

  getMasterQualification(): Observable<any> {
    return this.http.get(this.rootURL + '/Frontend/getMasterQualifications');
  }

  getDayCare(type: any, CounsellorID: number): Observable<any> {
    return this.http.get(this.rootURL + '/Centre/getAllCentre', {
      params: { type, CounsellorID },
    });
  }

  getCounsellorList(oldCounsellorID: number): Observable<any> {
    return this.http.get<any>(
      this.rootURL + '/DayCareCentreUser/getCounsellorList',
      { params: { oldCounsellorID } }
    );
  }

  assignDayCareByCounsellorID(
    newCounsellorID: number,
    oldCounsellorID: number
  ): Observable<any> {
    return this.http.put<any>(
      this.rootURL + '/DayCareCentreUser/assignDayCareByCounsellorID',
      null,
      { params: { newCounsellorID, oldCounsellorID } }
    );
  }

  AssignDaycareToCounsellorAfterActivate(
    CreatedByID: number,
    CounsellorID: number,
    DaycareList: number[]
  ): Observable<any> {
    return this.http.put<any>(
      this.rootURL +
        '/DayCareCentreUser/AssignDaycareToCounsellorAfterActivate',
      DaycareList,
      { params: { CreatedByID, CounsellorID } }
    );
  }

  getAllDays(): Observable<any> {
    return this.http.get<any>(this.rootURL + '/Classroom/getAllDays');
  }

  getCentreWorkingDaysByCentreID(centreID: number): Observable<any> {
    return this.http.get(
      this.rootURL + '/Centre/getCentreWorkingDaysByCentreID',
      { params: { centreID } }
    );
  }

  downloadExcelSheetFormatBloomvieAdmin(): Observable<any> {
    return this.http.get<any>(
      this.rootURL +
        '/DayCareCentreUser/DownloadBulkUploadSheetForBloomvieAdmin'
    );
  }

  getAllJobPostingTeachersByCentreID(CentreID: number): Observable<any> {
    return this.http.get(
      `${this.rootURL}/DayCareCentreUser/getAllJobPostingTeachersByCentreID`,
      { params: { CentreID } }
    );
  }

  getAllAvailableTocTeachers(CentreID: number): Observable<any> {
    return this.http.get<any>(
      `${this.rootURL}/Frontend/getAcceptedTocTeacherByCentreID`,
      { params: { CentreID } }
    );
  }
}
