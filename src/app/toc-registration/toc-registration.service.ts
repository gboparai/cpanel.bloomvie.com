import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api.types';

@Injectable({
  providedIn: 'root',
})
export class TocRegistrationService {
  private refreshSidebarSubject = new BehaviorSubject<boolean>(false);
  refreshSidebar$ = this.refreshSidebarSubject.asObservable();

  //Added on 28/01/25 for hideTocModal
  private hideModalSubject = new Subject<void>();
  hideModal$ = this.hideModalSubject.asObservable();

  hideProfileModal() {
    this.hideModalSubject.next();
  }

  private refreshSubject = new Subject<void>();
  refresh$ = this.refreshSubject.asObservable();

  refreshTocSubject() {
    this.refreshSubject.next();
  }
  //End

  triggerSidebarRefresh() {
    this.refreshSidebarSubject.next(true);
  }

  readonly roootUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getDocumentTypeList(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.roootUrl + '/User/getAllMasterDocumentType');
  }

  ManageAppliedTOC(combinedData: any): Observable<ApiResponse<any>> {
    const requestPayload = {
      Data: combinedData.Data,
      SlotTime: combinedData.SlotTime,
    };

    return this.http.post<ApiResponse<any>>(
      this.roootUrl + '/Frontend/ManageAppliedTOC',
      requestPayload
    );
  }

  ManageTOCMoreCentre(combinedData: any): Observable<ApiResponse<any>> {
    const requestPayload = {
      Data: combinedData.Data,
      SlotTime: combinedData.SlotTime,
    };

    return this.http.post<ApiResponse<any>>(
      this.roootUrl + '/Frontend/ManageTOCMoreCentre',
      requestPayload
    );
  }

  updateTocUserDetail(obj: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      this.roootUrl + '/Frontend/updateTocUserDetail',
      obj
    );
  }

  uploadImages(postData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      this.roootUrl + '/Common/uploadImages',
      postData
    );
  }
  getQualifications(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.roootUrl + '/Frontend/getMasterQualifications');
  }

  getAllAreaOfExpertise(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.roootUrl + '/User/GetAreaOfExpertise');
  }

  getTOCUserDetailByID(ID: string, centreID: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.roootUrl + '/Frontend/getTOCUserDetailByID', {
      params: { ID, centreID },
    });
  }

  GetUserById(ID: any, userRoleID?: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.roootUrl + '/User/getUserByID', {
      params: { ID },
    });
  }

  getTOCUserSlotById(Id: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.roootUrl + '/Frontend/getTOCUserSlotById', {
      params: { Id },
    });
  }

  updateTOCUserSlot(obj: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      this.roootUrl + '/Frontend/updateTOCUserSlot',
      obj
    );
  }

  deleteTOCUserSlot(obj: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      this.roootUrl + '/Frontend/deleteTOCUserSlot',
      obj
    );
  }

  deleteTOCUserAvailableSlots(userid: any, day: any, centreId: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      this.roootUrl + '/Frontend/deleteTOCUserAvailableSlots',
      { params: { userid, day, centreId } }
    );
  }

  ManageTocSlots(obj: any[]): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.roootUrl + '/Frontend/ManageTocSlots', obj);
  }

  getAllMasterStatus(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      this.roootUrl + '/SubscriptionPlans/getAllMasterStatus'
    );
  }

  GetAllDayCareWithInRadius(lat: number, lng: number, radius: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.roootUrl + "/Frontend/GetAllDayCareWithInRadius", { params: { lat, lng, radius } });
  }
  
}
