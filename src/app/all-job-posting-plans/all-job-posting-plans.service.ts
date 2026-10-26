import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class AllJobPostingPlansService {
  readonly URL = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getAllJobPostingPlans(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + '/Centre/getAllJobPostingPlans');
  }
  getJobPostingPlan(planID: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + '/Centre/getJobPostingPlan', { params: { planID } });
  }
  JobPostPlanBuy(model: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.URL + '/Centre/JobPostPlanBuy', model);
  }
}
