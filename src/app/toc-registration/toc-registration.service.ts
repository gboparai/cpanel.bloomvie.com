import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment.development';

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

  getDocumentTypeList(): Observable<any> {
    return this.http.get<any>(this.roootUrl + '/User/getAllMasterDocumentType');
  }

  // ManageAppliedTOC(data:any,SlotTime:any):Observable<any>
  // {
  //   return this.http.post<any>(this.roootUrl+"/Frontend/ManageAppliedTOC",data,SlotTime)
  // }

  //Commented on 17/12/24
  // ManageAppliedTOC(data: any, SlotTime: any): Observable<any> {
  //   const requestPayload = {
  //     Data: data,
  //     SlotTime: SlotTime
  //   };

  //   return this.http.post<any>(this.roootUrl + "/Frontend/ManageAppliedTOC", requestPayload);
  // }

  ManageAppliedTOC(combinedData: any): Observable<any> {
    const requestPayload = {
      Data: combinedData.Data,
      SlotTime: combinedData.SlotTime,
    };

    return this.http.post<any>(
      this.roootUrl + '/Frontend/ManageAppliedTOC',
      requestPayload
    );
  }

  ManageTOCMoreCentre(combinedData: any): Observable<any> {
    const requestPayload = {
      Data: combinedData.Data,
      SlotTime: combinedData.SlotTime,
    };

    return this.http.post<any>(
      this.roootUrl + '/Frontend/ManageTOCMoreCentre',
      requestPayload
    );
  }

  updateTocUserDetail(obj: any): Observable<any> {
    return this.http.post<any>(
      this.roootUrl + '/Frontend/updateTocUserDetail',
      obj
    );
  }

  uploadImages(postData: any): Observable<any> {
    return this.http.post<any>(
      this.roootUrl + '/Common/uploadImages',
      postData
    );
  }
  getQualifications(): Observable<any> {
    return this.http.get(this.roootUrl + '/Frontend/getMasterQualifications');
  }

  getAllAreaOfExpertise(): Observable<any> {
    return this.http.get(this.roootUrl + '/User/GetAreaOfExpertise');
  }

  // getTOCUserDetailByID(ID: string): Observable<any> {
  //   return this.http.get(this.roootUrl + '/Frontend/getTOCUserDetailByID', {
  //     params: { ID },
  //   });
  // }

   getTOCUserDetailByID(ID: string , centreID : number): Observable<any> {
    return this.http.get(this.roootUrl + '/Frontend/getTOCUserDetailByID', {
      params: { ID,centreID },
    });
  }

  GetUserById(ID: any, userRoleID?: any): Observable<any> {
    return this.http.get<any>(this.roootUrl + '/User/getUserByID', {
      params: { ID },
    });
  }

  getTOCUserSlotById(Id: any) {
    return this.http.get<any>(this.roootUrl + '/Frontend/getTOCUserSlotById', {
      params: { Id },
    });
  }

  updateTOCUserSlot(obj: any) {
    return this.http.post<any>(
      this.roootUrl + '/Frontend/updateTOCUserSlot',
      obj
    );
  }

  deleteTOCUserSlot(obj: any) {
    return this.http.post<any>(
      this.roootUrl + '/Frontend/deleteTOCUserSlot',
      obj
    );
  }

  deleteTOCUserAvailableSlots(userid: any, day: any,centreId: any) {
    return this.http.get<any>(
      this.roootUrl + '/Frontend/deleteTOCUserAvailableSlots',
      { params: { userid, day,centreId } }
    );
  }

  ManageTocSlots(obj: any[]) {
    return this.http.post<any>(this.roootUrl + '/Frontend/ManageTocSlots', obj);
  }

  getAllMasterStatus(): Observable<any> {
    return this.http.get(
      this.roootUrl + '/SubscriptionPlans/getAllMasterStatus'
    );
  }

  GetAllDayCareWithInRadius(lat:number,lng:number,radius:number):Observable<any>{
    return this.http.get(this.roootUrl+"/Frontend/GetAllDayCareWithInRadius",{params:{lat,lng,radius}});
  }
  
}
