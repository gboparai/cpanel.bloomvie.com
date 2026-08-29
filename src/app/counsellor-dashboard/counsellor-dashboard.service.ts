import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CounsellorDashboardService {

  public rootURL = environment.apiUrl;
  constructor(private http : HttpClient) { }

  getTodaysMeetings(CounsellorID:number) :Observable<any>
  {
    return this.http.get<any>(this.rootURL+'/Dashboard/getTodaysMeetings',{params:{CounsellorID}});
  }

  getCounsellorDashboardCount(counsellorID:number,TimeZone:string):Observable<any>
  {
    return this.http.get<any>(this.rootURL+'/Dashboard/getCounsellorDashboardCount',{params:{counsellorID,TimeZone}});
    
  }
}
