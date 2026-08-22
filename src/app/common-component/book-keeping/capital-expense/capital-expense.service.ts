import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CapitalExpenseService {
  rootUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getSuuplyRequest(CentreadminId: any, status: string) {
    return this.http.get(this.rootUrl + "/Common/getSupplyRequest", { params: { CentreadminId, status } })
  }

  getAllExpensesListBasedOnType(centreAdminID:number,type:string,startDate:any,endDate:any,searchText: string){
    return this.http.get(this.rootUrl + "/Common/getAllExpensesListBasedOnType",{params:{centreAdminID,type,startDate,endDate,searchText}})
  }
}
