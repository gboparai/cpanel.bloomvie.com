import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, DaycareDaysItem, ForInterestedAppliedJobTOCItem } from '../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class TocViewService {
  readonly roootUrl=environment.apiUrl
  constructor(private http:HttpClient) { }

// getAppliedJobTOCList(Name:any,statusID:any,pinCode:any):Observable<any>
// {
//   return this.http.get(this.roootUrl+"/Frontend/getAppliedJobTOCList",{params:{Name,statusID,pinCode}})
// }

getAppliedJobTOCList(Name:any,statusID:any,centreId:any):Observable<ApiResponse<ForInterestedAppliedJobTOCItem[]>>
{
  return this.http.get<ApiResponse<ForInterestedAppliedJobTOCItem[]>>(this.roootUrl+"/Frontend/getAppliedJobTOCList",{params:{Name,statusID,centreId}})
}

// getAppliedJobTOByID(id:any):Observable<any>{
//   return this.http.get(this.roootUrl+"/Frontend/getAppliedJobTOByID",{params : {id}});
// }

getAppliedJobTOByID(id:any,centreID : number):Observable<ApiResponse<ForInterestedAppliedJobTOCItem>>{
  return this.http.get<ApiResponse<ForInterestedAppliedJobTOCItem>>(this.roootUrl+"/Frontend/getAppliedJobTOByID",{params : {id,centreID}});
}

getQualifications():Observable<ApiResponse<any>>
{
  return this.http.get<ApiResponse<any>>(this.roootUrl+"/Frontend/getMasterQualifications")
}
getDocumentTypeList():Observable<ApiResponse<any>>{
  return this.http.get<ApiResponse<any>>(this.roootUrl+'/User/getAllMasterDocumentType');
}

tocApprovedReject(obj: any):Observable<ApiResponse<any>>
{
return this.http.post<ApiResponse<any>>(this.roootUrl+'/Frontend/tocApprovedReject',obj);
}


SendTOCRequestToUser(Slotid:any,LoginUserid:any):Observable<ApiResponse<any>>
{
  return this.http.get<ApiResponse<any>>(this.roootUrl+"/Frontend/SendTOCRequestToUser",{params:{Slotid,LoginUserid}})
}

SendSlotRequestToUserAtOnce(requestData: any[]): Observable<ApiResponse<any>> {
  return this.http.post<ApiResponse<any>>(this.roootUrl + "/Frontend/SendSlotRequestToUserAtOnce", requestData);
}

GetAllDays():Observable<ApiResponse<DaycareDaysItem[]>>{
  return this.http.get<ApiResponse<DaycareDaysItem[]>>(this.roootUrl + "/Classroom/getAllDays");
}

getTocUserFilter(obj : any):Observable<ApiResponse<any>>{
  return this.http.post<ApiResponse<any>>(this.roootUrl + '/Frontend/getTocUserWithOtherFilters',obj);
}


}
