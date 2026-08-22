import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';
import { identifierName } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class ManageDaycareService {
private readonly rootURL:string=environment.apiUrl;
  constructor(private http:HttpClient) { }

  manageDayCare(postData:any):Observable<any>{
    return this.http.post<any>(this.rootURL+'/Centre/manageCentreInformation',postData)
  }

  getDocumentTypeList():Observable<any>{
    return this.http.get<any>(this.rootURL+'/User/getAllMasterDocumentType');
  }
  manageDocument(postData:any):Observable<any>{
    return this.http.post<any>(this.rootURL+'/Common/manageMasterDocument',postData);
  }
  manageBankingInfo(postData:any):Observable<any>{
    return this.http.post<any>(this.rootURL+'/Centre/manageBankingInfo',postData);
  }
  getDocumentList(ReferenceID:number):Observable<any>{
    return this.http.get<any>(this.rootURL+'/Common/getDaycareDocumentList',{params:{ReferenceID}});
  }
  getDaycareCenterInfo(ID:number):Observable<any>{
    return this.http.get<any>(this.rootURL+'/Centre/getDaycareCenterInformationByID',{params:{ID}});
  }
  getDaycareAdminBankingInfo(DaycareID:number):Observable<any>{
    return this.http.get<any>(this.rootURL+'/Centre/getDaycareAdminbankingInfo',{params:{DaycareID}});
  }

  getDayCareByCentreAdminID(Id:any):Observable<any>{
    return this.http.get<any>(this.rootURL+'/DayCareCentreUser/getDayCareByCentreAdminID',{params:{Id}});
  }
}
