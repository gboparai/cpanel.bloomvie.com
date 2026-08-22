import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';


@Injectable({
  providedIn: 'root'
})
export class SchedulerService {
  private readonly rootURL: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

getCentreStaffList(centreID: number,NameOrEmail:any,type:string,IsOnlystaff:boolean): Observable<any> {
    return this.http.get<any>(this.rootURL + '/DayCareCentreUser/getCentreStaffList', { params: { centreID,NameOrEmail,type,IsOnlystaff } });
}

getStudentList(daycareID:number): Observable<any> {
    return this.http.get<any>(this.rootURL + "/DayCareCentreUser/getStudentsByDayCareID", {params:{daycareID}});
}
deleteClassAssignment(timeSlot: any, scheduleType: string): Observable<any> {
  const payload = {
    classID: timeSlot.classID,
    dayId: timeSlot.dayId,
    startTime: timeSlot.startTime,
    endTime : timeSlot.endTime,
    assignmentDate: timeSlot.assignmentDate,
    isRepeated: timeSlot.isRepeated != null ? timeSlot.isRepeated : null,
    userId: timeSlot.userId,
    scheduleType: scheduleType
  };

  return this.http.post(`${this.rootURL}/Classroom/deleteClassAssignment`, payload);
}

editAssignment(obj: any): Observable<any> {
  return this.http.post(`${this.rootURL}/Classroom/editAssignment`, obj);
}

}
