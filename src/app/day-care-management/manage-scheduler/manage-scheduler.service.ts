import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ManageSchedulerService {
  private readonly rootURL: string = environment.apiUrl;
  constructor(private http : HttpClient) { }
  
  getDaycareClasses(ID: number): Observable<any> {
    return this.http.get<{ id: number; name: string }>(this.rootURL + '/Classroom/getDaycareClassListDropdown', { params: { ID } });
  }

  GetAllDays():Observable<any>{
    return this.http.get(this.rootURL + "/Classroom/getAllDays");
  }

  getCentreWorkingDaysByCentreID(centreID: number): Observable<any> {
    return this.http.get(this.rootURL + '/Centre/getCentreWorkingDaysByCentreID',{ params: { centreID }});
  }

  getAllAvailableTeachersByCentreID(ClassID: number, classTimings: any[],Type: string): Observable<any> {
    return this.http.post<any>(this.rootURL + '/Classroom/getAllAvailableTeachersByCentreIDUsingType', classTimings, { params: { ClassID ,Type} });
  }

  BulkClassAssignment(BulkTeacherAssignment: any[], userType: string): Observable<any> {
  const body = {
    BulkTeacherAssignment: BulkTeacherAssignment,
    userType: userType
  };
  return this.http.post<any>(`${this.rootURL}/Classroom/BulkClassAssignment`, body);
}

}
