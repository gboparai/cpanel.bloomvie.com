import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api.types';

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
  ): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      this.rootURL + '/SlotTimeTable/GetDayCareAppointments',
      { params: { statusID, searchItem, regionHours, regionMinutes } }
    );
  }

  getIntersetedUserByID(
    id: any,
    regionHours: number,
    regionMinutes: number
  ): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      this.rootURL + '/SlotTimeTable/getInterestedDayCareById',
      { params: { id, regionHours, regionMinutes } }
    );
  }

  ManageCousellor(obj: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      this.rootURL + '/SlotTimeTable/manageForDayCareInterestedUsers',
      obj
    );
  }

  changeDayCareRequest(id: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      this.rootURL + '/SlotTimeTable/changeRequestOfDayCareUser',
      null,
      { params: { id } }
    );
  }

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
  ): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
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

  getSubscriptionPlanByUserId(Id: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      this.rootURL + '/Frontend/getSubscriptionplanByUserId',
      { params: { Id } }
    );
  }

  completeDaycareMeeting(id: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      this.rootURL + '/SlotTimeTable/maketheMeetingCompleteByDayCareId',
      null,
      { params: { id } }
    );
  }

  CheckInterestedEmailExist(email: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      this.rootURL + '/User/CheckInterestedEmailExist',
      { params: { email } }
    );
  }

  getZoomMeetingLink(zoomMeetingForm: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      this.rootURL + '/Zoom/CreateZoomMeeting',
      zoomMeetingForm
    );
  }

  dayCareMeetingJoined(id: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      this.rootURL + '/SlotTimeTable/dayCareMeetingJoined',
      null,
      { params: { id } }
    );
  }

  getFilteredData(filteredObj: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      this.rootURL + '/SlotTimeTable/getFilteredData',
      filteredObj
    );
  }

  getAllCounsellorBySlotID(slotID: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      this.rootURL + '/SlotTimeTable/getAllCounsellorBySlotID',
      { params: { slotID } }
    );
  }

  dayCareAssignmentToCounsellor(
    CounsellorID: any,
    centreID: any
  ): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      this.rootURL + '/User/dayCareAssignmentToCounsellor',
      { params: { CounsellorID, centreID } }
    );
  }
}
