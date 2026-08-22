import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ClassroomDetailsService {
  readonly URL = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getSections(id: number, name: any): Observable<any> {
    return this.http.get<any>(this.URL + '/Classroom/getSections', {
      params: { id, name },
    });
  }
  manageNapTime(obj: any): Observable<any> {
    return this.http.post<any>(
      this.URL + '/Classroom/manageStudentNapTime',
      obj
    );
  }

  manageFood(obj: any): Observable<any> {
    return this.http.post<any>(this.URL + '/Classroom/manageFood', obj);
  }

  getFoodType(): Observable<any> {
    return this.http.get<any>(this.URL + '/Classroom/getFoodType');
  }

  getMealType(obj: any): Observable<any> {
    return this.http.post<any>(this.URL + '/Classroom/getMealType', obj);
  }

  getStudentDetails(
    studentId: any,
    startDate: any,
    endDate: any
  ): Observable<any> {
    return this.http.get<any>(
      this.URL + '/Classroom/getStudentDetailsByStudentID',
      { params: { studentId, startDate, endDate } }
    );
  }

  getClassListByCentreId(id: any): Observable<any> {
    return this.http.get(this.URL + '/Classroom/getClassListByDaycareID', {
      params: { id },
    });
  }


  editStudentActivity(data: any): Observable<any> {
    return this.http.post<any>(this.URL + '/Classroom/editStudentActivity', data);
  }


  manageStudentRequest(requestData: any): Observable<any> {
    return this.http.post<any>(this.URL + '/Classroom/manageStudentRequest', requestData);
  }


  manageStudentActivity(obj: any): Observable<any> {
    return this.http.post<any>(
      this.URL + '/Classroom/manageStudentActivity',
      obj
    );
  }

  getTeacherAvailability(userId:number,centreId:any){
    return this.http.get<any>(this.URL + '/Common/getTeacherAvailability',{params :{userId,centreId}})
  }
  

  studentActivityImageDelete(data: any): Observable<any> {
    return this.http.post<any>(this.URL + '/Classroom/studentActivityImageDelete', data);
  }

  getStudentProfileByStudentID(Id: any): Observable<any> {
    return this.http.get<any>(
      this.URL + '/Classroom/getStudentProfileByStudentID',
      { params: { Id } }
    );
  }

  
  getStudentActivityByActivityID(activityID: any): Observable<any> {
    return this.http.get<any>(
      this.URL + '/Classroom/getStudentActivityByActivityID',
      { params: { activityID } }
    );
  }


  getClassRoomByTeacherID(
    teacherId: any,
    userRoleId: any,
    DayCareID: any
  ): Observable<any> {
    return this.http.get<any>(this.URL + '/Classroom/getClassRoomByTeacherID', {
      params: { teacherId, userRoleId, DayCareID },
    });
  }


  getChildDailyRoutine(id: any): Observable<any> {
    return this.http.get<any>(
      this.URL + '/Classroom/getChildDailyRoutineByStudentID',
      { params: { id } }
    );
  }




  getClassRoom(
    centreID: any,
    teacherID: any,
    userRoleID: any
  ): Observable<any> {
    return this.http.get<any>(this.URL + '/Classroom/getClassRoom', {
      params: { centreID, teacherID, userRoleID },
    });
  }

  getStudentByClassID(
    centreID: any,
    classRoomID: any,
    name: any
  ): Observable<any> {
    return this.http.get<any>(this.URL + '/Classroom/getStudentByClassID', {
      params: { centreID, classRoomID, name },
    });
  }

  getCentreWorkingDaysByCentreID(centreID: number): Observable<any> {
    return this.http.get(this.URL + '/Centre/getCentreWorkingDaysByCentreID', {
      params: { centreID },
    });
  }

  getStudentMediaRequest(userRoleID: any): Observable<any> {
    return this.http.get(this.URL + '/Classroom/getStudentMediaRequest', {
      params: { userRoleID },
    });
  }





  
}
