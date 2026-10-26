import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class CapitalExpenseService {
  rootUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getSuuplyRequest(CentreadminId: any, status: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + "/Common/getSupplyRequest", { params: { CentreadminId, status } });
  }

  getAllExpensesListBasedOnType(centreAdminID: number, type: string, startDate: any, endDate: any, searchText: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + "/Common/getAllExpensesListBasedOnType", { params: { centreAdminID, type, startDate, endDate, searchText } });
  }
}
