import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class DaycareQuestionnaireService {

  readonly URL = environment.apiUrl;
  constructor(private http: HttpClient) { }

  SubmitControlAndLabelForm(model: any): Observable<ApiResponse<any>> {
     return this.http.post<ApiResponse<any>>(this.URL + '/DynamicForm/SubmitControlAndLabelForm', model);
  }

  SubmitControlFieldAnswers(model: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.URL + '/Common/SubmitControlFieldAnswers', model);
  }
  SubmitSection(model: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.URL + '/DynamicForm/SubmitSection', model);
  }
  GetSectionByCentreID(centreID: any, url: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + "/DynamicForm/GetSectionByCentreID", { params: { centreID: centreID, url: url } });
  }
  ActiveInActiveSections(model: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.URL + "/DynamicForm/ActiveInActiveSections", model);
  }
  CopyIsMasterTrueSections(centreID: any, userID: any, userRoleID: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + "/DynamicForm/CopyIsMasterTrueSections", { params: { centreID: centreID, userID: userID, userRoleID: userRoleID } });
  }
  CopyIsMasterTrueFields(model: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.URL + "/DynamicForm/CopyIsMasterTrueFields", model);
  }
  GetSectionByIDAndCentreID(sectionID: number, centreID: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + "/DynamicForm/GetSectionByIDAndCentreID", { params: { sectionID: sectionID, centreID: centreID } });
  }
  GetControlFieldById(controlID: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + "/DynamicForm/GetControlFieldById", { params: { controlID: controlID } });
  }
  SubmitEditedSection(model: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.URL + "/DynamicForm/SubmitEditedSection", model);
  }
  SaveEditedSelectiveValue(model: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.URL + "/DynamicForm/SaveEditedSelectiveValue", model);
  }
  ActiveOrInActiveSelectiveValue(model: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.URL + "/DynamicForm/ActiveOrInActiveSelectiveValue", model);
  }
  ActiveOrInActiveControlField(model: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.URL + "/DynamicForm/ActiveOrInActiveControlField", model);
  }
  SubmitEditedControlField(model: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.URL + "/DynamicForm/SubmitEditedControlField", model);
  }
}
