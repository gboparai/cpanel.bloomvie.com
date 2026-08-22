import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AllJobPostingPlansService {
readonly URL = environment.apiUrl;
  constructor(private http:HttpClient) { }

  getAllJobPostingPlans():Observable<any>{
    return this.http.get(this.URL+'/Centre/getAllJobPostingPlans');
  }
  getJobPostingPlan(planID:number):Observable<any>{
    return this.http.get(this.URL+'/Centre/getJobPostingPlan',{params:{planID:planID}});
  }
  JobPostPlanBuy(model:any):Observable<any>{
    return this.http.post(this.URL+'/Centre/JobPostPlanBuy',model);
  }
  

}
