import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

getAppliedJobTOCList(Name:any,statusID:any,centreId:any):Observable<any>
{
  return this.http.get(this.roootUrl+"/Frontend/getAppliedJobTOCList",{params:{Name,statusID,centreId}})
}

// getAppliedJobTOByID(id:any):Observable<any>{
//   return this.http.get(this.roootUrl+"/Frontend/getAppliedJobTOByID",{params : {id}});
// }

getAppliedJobTOByID(id:any,centreID : number):Observable<any>{
  return this.http.get(this.roootUrl+"/Frontend/getAppliedJobTOByID",{params : {id,centreID}});
}

getQualifications():Observable<any>
{
  return this.http.get(this.roootUrl+"/Frontend/getMasterQualifications")
}
getDocumentTypeList():Observable<any>{
  return this.http.get<any>(this.roootUrl+'/User/getAllMasterDocumentType');
}

tocApprovedReject(obj: any):Observable<any>
{
return this.http.post<any>(this.roootUrl+'/Frontend/tocApprovedReject',obj);
}


SendTOCRequestToUser(Slotid:any,LoginUserid:any):Observable<any>
{
  return this.http.get(this.roootUrl+"/Frontend/SendTOCRequestToUser",{params:{Slotid,LoginUserid}})
}

SendSlotRequestToUserAtOnce(requestData: any[]): Observable<any> {
  return this.http.post(this.roootUrl + "/Frontend/SendSlotRequestToUserAtOnce", requestData);
}

GetAllDays():Observable<any>{
  return this.http.get(this.roootUrl + "/Classroom/getAllDays");
}

getTocUserFilter(obj : any):Observable<any>{
  return this.http.post(this.roootUrl + '/Frontend/getTocUserWithOtherFilters',obj);
}


}
