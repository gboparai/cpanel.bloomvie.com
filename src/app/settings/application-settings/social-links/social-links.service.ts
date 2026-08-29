import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocialLinksService {
private readonly rootURL:string=environment.apiUrl;
  constructor(private http:HttpClient) { }

  manageDaycareSocailLinks(postData:any):Observable<any>{
    return this.http.post<any>(this.rootURL+'/Centre/manageDaycareSocialLinks',postData);
  }
  getSocialMediaLinks(dayCareID: number): Observable<any> {
    return this.http.get<any>(this.rootURL + '/Centre/socialMediaLinks',{params:{dayCareID}});
  }

  managePayrollFrequency(postData:any):Observable<any>{
    return this.http.post<any>(this.rootURL+'/DayCareCentreUser/manageDayCareCentrePayrollFrequency',postData);
  }

  getPayrollFrequencyByDaycareID(centreID:number):Observable<any>{
    return this.http.get<any>(this.rootURL + '/Centre/getPayrollFrequencyByDaycareID',{params:{centreID}});
  }

}
