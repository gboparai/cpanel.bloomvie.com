import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AddMasterFacilityService {
readonly rootUrl=environment.apiUrl;

  constructor(private http:HttpClient) { }


  ManageFacility(MasterFacilitiesBO:any):Observable<any>
  {
    return this.http.post<any>(this.rootUrl+"/Centre/manageFacilities",MasterFacilitiesBO)
  }

  GetAllFacilities():Observable<any>
  {
    return this.http.get<any>(this.rootUrl+"/Common/getAllFacility")
  }

  GetFacilityById(id:any):Observable<any>
  {
    return this.http.get<any>(this.rootUrl+"/Centre/getFacilitiesByID",{params:{id}})
  }

  ActiveInactiveFacilityId(id:any):Observable<any>
  {
    return this.http.get<any>(this.rootUrl+"/Centre/activeInactiveFacilityByID",{params:{id}})
  }
}
