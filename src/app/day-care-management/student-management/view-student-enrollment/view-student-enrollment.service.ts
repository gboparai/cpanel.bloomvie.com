import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ViewStudentEnrollmentService {

  readonly URL = environment.apiUrl
    constructor(private http: HttpClient) { }

    getStudent(daycareID:number): Observable<any> {
      return this.http.get<any>(this.URL + "/DayCareCentreUser/getStudentsByDayCareID", {params:{daycareID}});
    }

    getStudentParentDetailsByStudentID(studentID:number): Observable<any> {
      return this.http.get<any>(this.URL + "/DayCareCentreUser/getStudentParentDetailsByStudentID", {params:{studentID}});
    }

    getClassList(centreID:any,ageGroupID:any):Observable<any> {
      return this.http.get<any>(this.URL+"/Classroom/getClassListDropdownByAgeGroup",{params:{centreID,ageGroupID}});
    }

    getSectionList(classID:any):Observable<any> {
      return this.http.get(this.URL+"/Classroom/getSectionByClassID",{params:{classID}});
    }

    studentClassAssignment(studentData:any):Observable<any> {
      return this.http.post(this.URL+"/DayCareCentreUser/studentClassAssignment",studentData);
    }

    assignTeacherForClass(TeacherBO:any):Observable<any>
    {
      return this.http.post(this.URL+"/DayCareCentreUser/assignTeacherForClass",TeacherBO)
    }
    getDayCarefortermsconditionsByCentreAdminID(id:any):Observable<any>{
      return this.http.get(this.URL+"/DayCareCentreUser/getDayCarefortermsconditionsByCentreAdminID",{params:{id}});
    }
    getTeacherStatusbyId(Id:any):Observable<any>{
      return this.http.get(this.URL+"/DayCareCentreUser/getTeacherStatusbyId",{params:{Id}});
    }
}
