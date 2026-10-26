import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse, ChildDailyRoutineItem } from '../../../models/api.types';

@Injectable({
  providedIn: 'root',
})
export class ChildRoutineService {
  readonly URL = environment.apiUrl;
  constructor(private http: HttpClient) {}

  manageChildDailyRoutine(dailyRoutineForm: ChildDailyRoutineItem | any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      this.URL + '/DayCareCentreUser/manageChildDailyRoutine',
      dailyRoutineForm
    );
  }

  //Arsh
  SubmitControlTypeAndLabelName(model: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      this.URL + '/Common/SubmitControlAndLabelForm',
      model
    );
  }

  GetControlAndLabelForm(id: any, userID: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + '/DynamicForm/GetControlAndLabelForm', {
      params: { centreID: id, userID: userID },
    });
  }
  SubmitControlFieldAnswers(model: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      this.URL + '/DynamicForm/SubmitControlFieldAnswers',
      model
    );
  }

  //Arsh
  submitCombinedData(data: any): Observable<ApiResponse<any>> {
    // return this.http.post('/api/submitData', data);
    return this.http.post<ApiResponse<any>>(
      this.URL + '/DayCareCentreUser/manageChildDailyRoutineWithDynamicForm',
      data
    );
  }
  getSectionByCentreID(centreID: any, url: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + '/DynamicForm/GetSectionByCentreID', {
      params: { centreID: centreID, url: url },
    });
  }
  SubmitSection(model: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.URL + '/DynamicForm/SubmitSection', model);
  }
  CopyIsMasterTrueSections(
    centreID: any,
    userID: any,
    userRoleID: any
  ): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      this.URL + '/DynamicForm/CopyIsMasterTrueSections',
      { params: { centreID: centreID, userID: userID, userRoleID: userRoleID } }
    );
  }
  getStudentLikesAndDislikes(parentID: any, studentID: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      this.URL + '/DayCareCentreUser/getStudentLikesAndDislikes',
      { params: { parentID: parentID, studentID: studentID } }
    );
  }


  getAllPendingOnboardingStudentByCentreIDAndParentID(CentreID:number , ParentID:number):Observable<ApiResponse<any>>{
    return this.http.get<ApiResponse<any>>(`${this.URL}/DayCareCentreUser/getAllPendingOnboardingStudentByCentreIDAndParentID`,{params:{CentreID,ParentID}})
  }
}
