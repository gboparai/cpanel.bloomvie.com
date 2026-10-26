import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class TocSlotRequestsService {
  readonly roootUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getTocSlotbyUserid(UserId: any, CentreId: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.roootUrl + "/Frontend/getTocSlotbyUserid", { params: { UserId, CentreId } });
  }

  SendSlotRequestToDayCare(centreId: any, slotId: any, userId: any, acceptReject: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.roootUrl + "/Frontend/SendSlotRequestToDayCare", { params: { centreId, slotId, userId, acceptReject } });
  }
}
