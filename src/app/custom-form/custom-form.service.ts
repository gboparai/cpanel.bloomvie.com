import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class CustomFormService {

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
  GetSectionByCentreID(centreID: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + "/DynamicForm/GetSectionByCentreID", { params: { centreID } });
  }
}
