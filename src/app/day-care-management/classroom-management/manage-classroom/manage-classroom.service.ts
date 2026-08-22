import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ManageClassroomService {
  readonly rootUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  ManageClasses(formDataArray: any): Observable<any> {
    return this.http.post<any>(
      this.rootUrl + '/Classroom/manageClasses',
      formDataArray
    );
  }

  editClass(id: number): Observable<any> {
    return this.http.get<any>(this.rootUrl + '/Classroom/getClassesByID', {
      params: { id },
    });
  }

  getSectionByClassID(classID: any): Observable<any> {
    return this.http.get<any>(this.rootUrl + '/Classroom/getSectionByClassID', {
      params: { classID },
    });
  }

  GetAllAgeGroup(CentreID: number): Observable<any> {
    return this.http.get<any>(
      this.rootUrl + '/Centre/getAllAgeGroupByCentreID',
      { params: { CentreID } }
    );
  }

  getClassListByDaycareID(daycareId: number,userRoleId:any,userId:any,searchText:string): Observable<any> {
    return this.http.get<any>(this.rootUrl + '/Classroom/getClassListByDaycareID',{params:{daycareId,userRoleId,userId,searchText}});
  }

  ActiveInactiveClassroom(id: number): Observable<any> {
    return this.http.get<any>(
      this.rootUrl + '/Classroom/activeInactiveclassByID',
      { params: { id } }
    );
  }

  getAllDays(): Observable<any> {
    return this.http.get<any>(this.rootUrl + '/Classroom/getAllDays');
  }

  getClassTeacher(CentreID: any, ClassID: any): Observable<any> {
    return this.http.get(this.rootUrl + '/Centre/getTeacherByCenterID', {
      params: { CentreID, ClassID },
    });
  }
  onClassDuplicateCheck(centreID: any, className: any): Observable<any> {
    return this.http.get(this.rootUrl + '/Centre/onClassDuplicateCheck', {
      params: { centreID, className },
    });
  }
  checkSectionExists(sectionName: string, centreID: any): Observable<any> {
    return this.http.get(this.rootUrl + '/Centre/checkSectionExists', {
      params: { sectionName, centreID },
    });
  }

  getCentreWorkingDaysByCentreID(centreID: number): Observable<any> {
    return this.http.get(
      this.rootUrl + '/Centre/getCentreWorkingDaysByCentreID',
      { params: { centreID } }
    );
  }

  checkSlotExists(slotObj: any): Observable<any> {
    return this.http.post<any>(
      this.rootUrl + '/Classroom/checkSlotExists',
      slotObj
    );
  }

  getClassroomCapacityByClassID(daycareID: number,inputCapacity:number): Observable<any> {
    return this.http.get<any>(
      this.rootUrl + '/Classroom/getClassroomCapacityByClassID',
      { params: { daycareID,inputCapacity } }
    );
  }
}
