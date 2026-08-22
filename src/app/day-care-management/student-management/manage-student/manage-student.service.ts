import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Observable, Subject } from 'rxjs';
import { parseArgs } from 'util';

@Injectable({
  providedIn: 'root',
})
export class ManageStudentService {
  private readonly rootURL: string = environment.apiUrl;
  private locationDataSubject = new Subject<any>();
  constructor(private http: HttpClient) {}
  manageStudentEnrollment(postData: any): Observable<any> {
    return this.http.post<any>(
      this.rootURL + '/DayCareCentreUser/manageStudentEnrollment',
      postData
    );
  }
  getClassesByAgeGroup(CentreID: number, AgeGroupID: number): Observable<any> {
    return this.http.get<{ id: number; name: string }>(
      this.rootURL + '/Classroom/getClassListDropdownByAgeGroup',
      { params: { CentreID, AgeGroupID } }
    );
  }

  getDaycareStudentList(
    id: number,
    searchItem: any,
    userRoleId: number,
    userId: number,
    classId: number,
    type: any
  ): Observable<any> {
    
    return this.http.get<any>(
      this.rootURL + '/DayCareCentreUser/getChildrenListByCentreID',
      { params: { id, searchItem, userRoleId, userId, classId, type } }
    );
  }

  activeInactiveEnrolledStudent(ID: number): Observable<any> {
    return this.http.get<any>(
      this.rootURL + '/DayCareCentreUser/activeInactiveEnrolledStudent',
      { params: { ID } }
    );
  }

  downloadBulkUploadFormatSheet(
    centreId: number,
    LoginUserID: any
  ): Observable<any> {
    return this.http.get<any>(
      this.rootURL + '/DayCareCentreUser/downloadBulkUploadSheetForStudent',
      { params: { centreId, LoginUserID } }
    );
  }
  uploadBulkStudent(
    postData: any,
    centreID: number,
    LoginUserID: any
  ): Observable<any> {
    return this.http.post<any>(
      this.rootURL + '/DayCareCentreUser/uploadBulkStudent',
      postData,
      { params: { centreID, LoginUserID } }
    );
  }

  manageParent(postData: any, studentID: number): Observable<any> {
    return this.http.post<any>(
      this.rootURL + '/DayCareCentreUser/manageParent',
      postData,
      { params: { studentID } }
    );
  }

  sendMailToParentAndTeacherForPassword(parentId: any): Observable<any> {
    return this.http.get<any>(
      this.rootURL +
        '/SubscriptionPayment/sendMailToParentAndTeacherForPassword',
      { params: { parentId } }
    );
  }

  GetAllAgeGroup(CentreID: number): Observable<any> {
    return this.http.get<any>(
      this.rootURL + '/Centre/getAllAgeGroupByCentreID',
      { params: { CentreID } }
    );
  }

  getDayCareCentreDetails(centreID: number): Observable<any> {
    return this.http.get<any>(
      this.rootURL + '/DayCareCentreUser/getDayCareCentreDetailsByCenterID',
      { params: { centreID } }
    );
  }

  getDayCareCentreClassDetails(classID: number): Observable<any> {
    return this.http.get<any>(
      this.rootURL + '/DayCareCentreUser/getDayCareCentreClassDetailsByClassID',
      { params: { classID } }
    );
  }

  checkEmailExistsForEnrollmentRequest(Email: string): Observable<any> {
    return this.http.get(
      `${this.rootURL}/Frontend/checkEmailExistsForEnrollmentRequest`,
      { params: { Email } }
    );
  }
}
