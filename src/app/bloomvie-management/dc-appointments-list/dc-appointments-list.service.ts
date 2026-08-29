import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { __param } from 'tslib';

@Injectable({
  providedIn: 'root',
})
export class DcAppointmentsListService {
  private readonly rootURL: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDayCareAppointments(
    statusID: any,
    searchItem: any,
    regionHours: number,
    regionMinutes: number
  ): Observable<any> {
    return this.http.get<any>(
      this.rootURL + '/SlotTimeTable/GetDayCareAppointments',
      { params: { statusID, searchItem, regionHours, regionMinutes } }
    );
  }

  getIntersetedUserByID(
    id: any,
    regionHours: number,
    regionMinutes: number
  ): Observable<any> {
    return this.http.get<any>(
      this.rootURL + '/SlotTimeTable/getInterestedDayCareById',
      { params: { id, regionHours, regionMinutes } }
    );
  }

  ManageCousellor(obj: any): Observable<any> {
    return this.http.post<any>(
      this.rootURL + '/SlotTimeTable/manageForDayCareInterestedUsers',
      obj
    );
  }

  changeDayCareRequest(id: number): Observable<any> {
    return this.http.put(
      this.rootURL + '/SlotTimeTable/changeRequestOfDayCareUser',
      null,
      { params: { id } }
    );
  }

  // SendEmailAfterMeeting(id :number , DDLval : string):Observable<any>{
  //   return this.http.get<any>(this.rootURL+'/SlotTimeTable/SendEmailAfterMeeting', {params:{id,DDLval}})
  // }

  SendEmailAfterMeeting(
    id: number,
    PlanID: string,
    planencryptID: any,
    dayCareUserencryptID: any,
    DiscountAmount: string,
    DayCareType: any,
    discount: string,
    trialDays: string,
    trialDaysCount: string
  ): Observable<any> {
    return this.http.get<any>(
      this.rootURL + '/SlotTimeTable/SendEmailAfterMeeting',
      {
        params: {
          id,
          PlanID,
          planencryptID,
          dayCareUserencryptID,
          DiscountAmount,
          DayCareType,
          discount,
          trialDays,
          trialDaysCount,
        },
      }
    );
  }

  getSubscriptionPlanByUserId(Id: any): Observable<any> {
    return this.http.get<any>(
      this.rootURL + '/Frontend/getSubscriptionplanByUserId',
      { params: { Id } }
    );
  }

  completeDaycareMeeting(id: any): Observable<any> {
    return this.http.put(
      this.rootURL + '/SlotTimeTable/maketheMeetingCompleteByDayCareId',
      null,
      { params: { id } }
    );
  }

  CheckInterestedEmailExist(email: any): Observable<any> {
    return this.http.get<any>(
      this.rootURL + '/User/CheckInterestedEmailExist',
      { params: { email } }
    );
  }

  getZoomMeetingLink(zoomMeetingForm: any): Observable<any> {
    return this.http.post<any>(
      this.rootURL + '/Zoom/CreateZoomMeeting',
      zoomMeetingForm
    );
  }

  dayCareMeetingJoined(id: number): Observable<any> {
    return this.http.put<any>(
      this.rootURL + '/SlotTimeTable/dayCareMeetingJoined',
      null,
      { params: { id } }
    );
  }

  getFilteredData(filteredObj: any): Observable<any> {
    return this.http.post<any>(
      this.rootURL + '/SlotTimeTable/getFilteredData',
      filteredObj
    );
  }

  getAllCounsellorBySlotID(slotID: number): Observable<any> {
    return this.http.get<any>(
      this.rootURL + '/SlotTimeTable/getAllCounsellorBySlotID',
      { params: { slotID } }
    );
  }

  dayCareAssignmentToCounsellor(
    CounsellorID: any,
    centreID: any
  ): Observable<any> {
    return this.http.get<any>(
      this.rootURL + '/User/dayCareAssignmentToCounsellor',
      { params: { CounsellorID, centreID } }
    );
  }
}
