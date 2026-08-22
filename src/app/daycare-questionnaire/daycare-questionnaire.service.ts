import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DaycareQuestionnaireService {

  readonly URL = environment.apiUrl;
  constructor(private http:HttpClient) { }

  SubmitControlAndLabelForm(model:any):Observable<any>{
     return this.http.post(this.URL+ '/DynamicForm/SubmitControlAndLabelForm',model);
  }


  SubmitControlFieldAnswers(model:any):Observable<any>{
    return this.http.post(this.URL+'/Common/SubmitControlFieldAnswers',model);
  }
  SubmitSection(model:any):Observable<any>{
    return this.http.post(this.URL+'/DynamicForm/SubmitSection',model);
  }
  GetSectionByCentreID(centreID:any,url:string):Observable<any>{
    return this.http.get<any>(this.URL+"/DynamicForm/GetSectionByCentreID",{params:{centreID:centreID,url:url}});
  }
  ActiveInActiveSections(model:any):Observable<any>{
    return this.http.post<any>(this.URL+"/DynamicForm/ActiveInActiveSections",model);
  }
  CopyIsMasterTrueSections(centreID:any,userID:any,userRoleID:any):Observable<any>{
    return this.http.get<any>(this.URL+"/DynamicForm/CopyIsMasterTrueSections",{params:{centreID:centreID,userID:userID,userRoleID:userRoleID}});
  }
  CopyIsMasterTrueFields(model:any):Observable<any>{
    return this.http.post<any>(this.URL+"/DynamicForm/CopyIsMasterTrueFields",model);
  }
  GetSectionByIDAndCentreID(sectionID:number,centreID:any):Observable<any>{
    return this.http.get<any>(this.URL+"/DynamicForm/GetSectionByIDAndCentreID",{params:{sectionID:sectionID,centreID:centreID}});
  }
  GetControlFieldById(controlID:number):Observable<any>{
    return this.http.get<any>(this.URL+"/DynamicForm/GetControlFieldById",{params:{controlID:controlID}});
  }
  SubmitEditedSection(model:any):Observable<any>{
    return this.http.post<any>(this.URL+"/DynamicForm/SubmitEditedSection",model);
  }
  SaveEditedSelectiveValue(model:any):Observable<any>{
    return this.http.post<any>(this.URL+"/DynamicForm/SaveEditedSelectiveValue",model);
  }
  ActiveOrInActiveSelectiveValue(model:any):Observable<any>{
    return this.http.post<any>(this.URL+"/DynamicForm/ActiveOrInActiveSelectiveValue",model);
  }
  ActiveOrInActiveControlField(model:any):Observable<any>{
    return this.http.post<any>(this.URL+"/DynamicForm/ActiveOrInActiveControlField",model);
  }
  SubmitEditedControlField(model:any):Observable<any>{
    return this.http.post<any>(this.URL+"/DynamicForm/SubmitEditedControlField",model);
  }
}
