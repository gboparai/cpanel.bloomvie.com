import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, StaffInfo, StudentInfo } from '../../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class SchedulerService {
  private readonly rootURL: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getCentreStaffList(centreID: number, NameOrEmail: any, type: string, IsOnlystaff: boolean): Observable<ApiResponse<StaffInfo[]>> {
    return this.http.get<ApiResponse<StaffInfo[]>>(this.rootURL + '/DayCareCentreUser/getCentreStaffList', { params: { centreID, NameOrEmail, type, IsOnlystaff } });
  }

  getStudentList(daycareID: number): Observable<ApiResponse<StudentInfo[]>> {
    return this.http.get<ApiResponse<StudentInfo[]>>(this.rootURL + "/DayCareCentreUser/getStudentsByDayCareID", { params: { daycareID } });
  }
  deleteClassAssignment(timeSlot: any, scheduleType: string): Observable<ApiResponse<any>> {
    const payload = {
      classID: timeSlot.classID,
      dayId: timeSlot.dayId,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
      assignmentDate: timeSlot.assignmentDate,
      isRepeated: timeSlot.isRepeated != null ? timeSlot.isRepeated : null,
      userId: timeSlot.userId,
      scheduleType: scheduleType
    };

    return this.http.post<ApiResponse<any>>(`${this.rootURL}/Classroom/deleteClassAssignment`, payload);
  }

  editAssignment(obj: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.rootURL}/Classroom/editAssignment`, obj);
  }
}
