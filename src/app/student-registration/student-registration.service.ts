import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ApiResponse,
  AddStudentRegistrationRequest,
} from '../models/api.types';

@Injectable({
  providedIn: 'root',
})
export class StudentRegistrationService {
  private readonly rootUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getPlanDetailsByUserID(ID: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.rootUrl}/DayCareCentreUser/getPlanDetailsByUserID`,
      { params: { ID } }
    );
  }

  GetAllAgeGroup(CentreID: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      this.rootUrl + '/Centre/getAllAgeGroupByCentreID',
      { params: { CentreID } }
    );
  }

  manageStudentRegistration(formObj: AddStudentRegistrationRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.rootUrl}/DayCareCentreUser/manageStudentRegistration`,
      formObj
    );
  }

  getSubscriptionPlansByCentreAndAgeID(
    centreID: number,
    ageGroupID: number
  ): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      this.rootUrl + '/SubscriptionPlans/getSubscriptionPlansByCentreAndAgeID',
      { params: { centreID, ageGroupID } }
    );
  }
}
