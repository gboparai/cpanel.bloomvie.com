import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class SuuplyService {
  rootUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  manageSuuplyRequest(supplyrequest: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.rootUrl + "/Common/manageSupplyRequest", supplyrequest);
  }

  getSuuplyRequest(CentreadminId: any, status: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + "/Common/getSupplyRequest", { params: { CentreadminId, status } });
  }

  approveOrRejectSupplyRequest(statusId: any, itemId: any, loginId: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + "/Common/approveOrRejectSupplyRequest", { params: { statusId, itemId, loginId } });
  }

  getSupplyRequestByLoginId(loginUserId: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + "/Common/getSupplyRequestByLoginId", { params: { loginUserId } });
  }

  getSupplyRequestById(itemId: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + "/Common/getSupplyRequestById", { params: { itemId } });
  }

  DeleteSupply(itemId: any, Message: any): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(this.rootUrl + "/Common/DeleteSupply", { params: { itemId, Message } });
  }

  getAllExpenseTypes(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + "/Common/getAllExpenseTypes");
  }

  reviewSupplyRequest(purchasedItem: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.rootUrl + "/Common/reviewSupplyRequest", purchasedItem);
  }
}
