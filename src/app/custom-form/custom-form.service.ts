import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomFormService {

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
  GetSectionByCentreID(centreID:any):Observable<any>{
    return this.http.get<any>(this.URL+"/DynamicForm/GetSectionByCentreID",{params:{centreID:centreID}});
  }
}
