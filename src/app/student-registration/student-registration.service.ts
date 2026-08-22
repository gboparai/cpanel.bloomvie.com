import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ObservableLike } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class StudentRegistrationService {
  private readonly rootUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getPlanDetailsByUserID(ID: number): Observable<any> {
    return this.http.get(
      `${this.rootUrl}/DayCareCentreUser/getPlanDetailsByUserID`,
      { params: { ID } }
    );
  }

  GetAllAgeGroup(CentreID: number): Observable<any> {
    return this.http.get<any>(
      this.rootUrl + '/Centre/getAllAgeGroupByCentreID',
      { params: { CentreID } }
    );
  }

  manageStudentRegistration(formObj: any): Observable<any> {
    return this.http.post<any>(
      `${this.rootUrl}/DayCareCentreUser/manageStudentRegistration`,
      formObj
    );
  }

  getSubscriptionPlansByCentreAndAgeID(
    centreID: number,
    ageGroupID: number
  ): Observable<any> {
    return this.http.get<any>(
      this.rootUrl + '/SubscriptionPlans/getSubscriptionPlansByCentreAndAgeID',
      { params: { centreID, ageGroupID } }
    );
  }
}
