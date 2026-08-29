import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class WelcomeService {
  readonly rootUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getAllUserRoles(userRoleID: any): Observable<any> {
   
    return this.http.get<any>(
      this.rootUrl + '/User/getAllUserRoles',
      userRoleID
    );
  }

  getAllDayCareContent(): Observable<any> {
    
    return this.http.get<any>(
      this.rootUrl + '/ContentManagement/getAllDayCareContent'
    );
  }

  getDayCareFeatureByCentreID(CentreID: any): Observable<any> {
    return this.http.get<any>(
      this.rootUrl + '/ContentManagement/getDayCareFeatureByCentreID',
      { params: { CentreID } }
    );
  }

  getDaycareLogos(DaycareID: any): Observable<any> {
    
    return this.http.get(this.rootUrl + '/User/getDaycareLogos', {
      params: { DaycareID },
    });
  }

  getCentreIDByStudentID(StudentID: number): Observable<any> {
    return this.http.get(this.rootUrl + '/Frontend/getCentreIDByStudentID', {
      params: { StudentID },
    });
  }

  getAllDayCareContentLogo(): Observable<any> {
    
    return this.http.get<any>(
      this.rootUrl + '/ContentManagement/getAllDayCareContentLogo'
    );
  }
}
