import { environment } from './../../../environments/environment.development';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SmtpService {
  readonly rootUrl=environment.apiUrl

  constructor(private http:HttpClient) { }


  ManageSMTP(SmtpBO:any):Observable<any>{
   return this.http.post<any>(this.rootUrl+'/Common/manageSMTPSettings',SmtpBO)
  }

  GetAllSMTPSettings(centreID:number):Observable<any>{
    return this.http.get<any>(this.rootUrl+'/Common/getAllSMTPSettings',{params:{centreID}})
  }

  GetSMTPSettingbyId(id:any):Observable<any>{
    return this.http.get<any>(this.rootUrl+'/Common/getSMTPsettingsbyId',{params:{id}})
  }

  ActiveInactiveSMTPSettingbyId(id:any):Observable<any>{
    return this.http.get<any>(this.rootUrl+'/Common/activeInactiveSMTPSettingbyId',{params:{id}})
  }
}
