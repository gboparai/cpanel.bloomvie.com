import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChildRoutineService {
  readonly URL = environment.apiUrl;
  constructor(private http: HttpClient) {}

  manageChildDailyRoutine(dailyRoutineForm: any): Observable<any> {
    return this.http.post<any>(
      this.URL + '/DayCareCentreUser/manageChildDailyRoutine',
      dailyRoutineForm
    );
  }

  //Arsh
  SubmitControlTypeAndLabelName(model: any): Observable<any> {
    return this.http.post(
      this.URL + '/Common/SubmitControlAndLabelForm',
      model
    );
  }

  GetControlAndLabelForm(id: any, userID: number): Observable<any> {
    return this.http.get(this.URL + '/DynamicForm/GetControlAndLabelForm', {
      params: { centreID: id, userID: userID },
    });
  }
  SubmitControlFieldAnswers(model: any): Observable<any> {
    return this.http.post(
      this.URL + '/DynamicForm/SubmitControlFieldAnswers',
      model
    );
  }

  //Arsh
  submitCombinedData(data: any): Observable<any> {
    // return this.http.post('/api/submitData', data);
    return this.http.post<any>(
      this.URL + '/DayCareCentreUser/manageChildDailyRoutineWithDynamicForm',
      data
    );
  }
  getSectionByCentreID(centreID: any, url: string): Observable<any> {
    return this.http.get<any>(this.URL + '/DynamicForm/GetSectionByCentreID', {
      params: { centreID: centreID, url: url },
    });
  }
  SubmitSection(model: any): Observable<any> {
    return this.http.post<any>(this.URL + '/DynamicForm/SubmitSection', model);
  }
  CopyIsMasterTrueSections(
    centreID: any,
    userID: any,
    userRoleID: any
  ): Observable<any> {
    return this.http.get<any>(
      this.URL + '/DynamicForm/CopyIsMasterTrueSections',
      { params: { centreID: centreID, userID: userID, userRoleID: userRoleID } }
    );
  }
  getStudentLikesAndDislikes(parentID: any, studentID: any): Observable<any> {
    return this.http.get<any>(
      this.URL + '/DayCareCentreUser/getStudentLikesAndDislikes',
      { params: { parentID: parentID, studentID: studentID } }
    );
  }


  getAllPendingOnboardingStudentByCentreIDAndParentID(CentreID:number , ParentID:number):Observable<any>{
    return this.http.get<any>(`${this.URL}/DayCareCentreUser/getAllPendingOnboardingStudentByCentreIDAndParentID`,{params:{CentreID,ParentID}})
  }
}
