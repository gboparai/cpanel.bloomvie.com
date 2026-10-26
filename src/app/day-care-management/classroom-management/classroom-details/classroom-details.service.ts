import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ApiResponse,
  ClassroomDropdownItem,
  DaycareSectionItem,
  StudentActivityItem,
  ManageStudentRequestItem,
  StudentActivityImageItem,
  NapTimeItem,
  FoodItem,
  ChildDailyRoutineItem,
} from '../../../models/api.types';

@Injectable({
  providedIn: 'root',
})
export class ClassroomDetailsService {
  readonly URL = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getSections(id: number, name: any): Observable<ApiResponse<DaycareSectionItem[]>> {
    return this.http.get<ApiResponse<DaycareSectionItem[]>>(this.URL + '/Classroom/getSections', {
      params: { id, name },
    });
  }

  manageNapTime(obj: NapTimeItem | any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      this.URL + '/Classroom/manageStudentNapTime',
      obj
    );
  }

  manageFood(obj: FoodItem | any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.URL + '/Classroom/manageFood', obj);
  }

  getFoodType(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + '/Classroom/getFoodType');
  }

  getMealType(obj: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.URL + '/Classroom/getMealType', obj);
  }

  getStudentDetails(
    studentId: any,
    startDate: any,
    endDate: any
  ): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      this.URL + '/Classroom/getStudentDetailsByStudentID',
      { params: { studentId, startDate, endDate } }
    );
  }

  getClassListByCentreId(id: any): Observable<ApiResponse<ClassroomDropdownItem[]>> {
    return this.http.get<ApiResponse<ClassroomDropdownItem[]>>(this.URL + '/Classroom/getDaycareClassListDropdown', {
      params: { id },
    });
  }

  editStudentActivity(data: StudentActivityItem | any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.URL + '/Classroom/editStudentActivity', data);
  }

  manageStudentRequest(requestData: ManageStudentRequestItem | any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.URL + '/Classroom/manageStudentRequest', requestData);
  }

  manageStudentActivity(obj: StudentActivityItem | any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      this.URL + '/Classroom/manageStudentActivity',
      obj
    );
  }

  getTeacherAvailability(userId: number, centreId: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + '/Common/getTeacherAvailability', {
      params: { userId, centreId },
    });
  }

  studentActivityImageDelete(data: StudentActivityImageItem | any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.URL + '/Classroom/studentActivityImageDelete', data);
  }

  getStudentProfileByStudentID(Id: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      this.URL + '/Classroom/getStudentProfileByStudentID',
      { params: { Id } }
    );
  }

  getStudentActivityByActivityID(activityID: any): Observable<ApiResponse<StudentActivityItem>> {
    return this.http.get<ApiResponse<StudentActivityItem>>(
      this.URL + '/Classroom/getStudentActivityByActivityID',
      { params: { activityID } }
    );
  }

  getClassRoomByTeacherID(
    teacherId: any,
    userRoleId: any,
    DayCareID: any
  ): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + '/Classroom/getClassRoomByTeacherID', {
      params: { teacherId, userRoleId, DayCareID },
    });
  }

  getChildDailyRoutine(id: any): Observable<ApiResponse<ChildDailyRoutineItem>> {
    return this.http.get<ApiResponse<ChildDailyRoutineItem>>(
      this.URL + '/Classroom/getChildDailyRoutineByStudentID',
      { params: { id } }
    );
  }

  getClassRoom(
    centreID: any,
    teacherID: any,
    userRoleID: any
  ): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + '/Classroom/getClassRoom', {
      params: { centreID, teacherID, userRoleID },
    });
  }

  getStudentByClassID(
    centreID: any,
    classRoomID: any,
    name: any
  ): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + '/Classroom/getStudentByClassID', {
      params: { centreID, classRoomID, name },
    });
  }

  getCentreWorkingDaysByCentreID(centreID: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + '/Centre/getCentreWorkingDaysByCentreID', {
      params: { centreID },
    });
  }

  getStudentMediaRequest(userRoleID: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + '/Classroom/getStudentMediaRequest', {
      params: { userRoleID },
    });
  }
}
