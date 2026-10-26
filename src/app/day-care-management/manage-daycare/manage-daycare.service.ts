import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class ManageDaycareService {
  private readonly rootURL: string = environment.apiUrl;
  constructor(private http: HttpClient) { }

  manageDayCare(postData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.rootURL + '/Centre/manageCentreInformation', postData);
  }

  getDocumentTypeList(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootURL + '/User/getAllMasterDocumentType');
  }
  manageDocument(postData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.rootURL + '/Common/manageMasterDocument', postData);
  }
  manageBankingInfo(postData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.rootURL + '/Centre/manageBankingInfo', postData);
  }
  getDocumentList(ReferenceID: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootURL + '/Common/getDaycareDocumentList', { params: { ReferenceID } });
  }
  getDaycareCenterInfo(ID: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootURL + '/Centre/getDaycareCenterInformationByID', { params: { ID } });
  }
  getDaycareAdminBankingInfo(DaycareID: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootURL + '/Centre/getDaycareAdminbankingInfo', { params: { DaycareID } });
  }

  getDayCareByCentreAdminID(Id: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootURL + '/DayCareCentreUser/getDayCareByCentreAdminID', { params: { Id } });
  }
}
