import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api.types';

@Injectable({
  providedIn: 'root',
})
export class ApplicationServiceService {
  private readonly rootURL: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAppointmentList(
    statusID: any,
    searchItem: any,
    regionHours: number,
    regionMinutes: number
  ): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      this.rootURL + '/SlotTimeTable/getRescheduleOrCompleteDayCareList',
      { params: { statusID, searchItem, regionHours, regionMinutes } }
    );
  }

  rescheduleMeeting(rescheduleForm: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      this.rootURL + '/SlotTimeTable/rescheduledayCareMeeting',
      rescheduleForm
    );
  }

  getPlansForDaycare(userRoleId: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootURL + '/Common/getAllPlans', {
      params: { userRoleId },
    });
  }

  getAllStudentMediaPlans(userRoleId: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      this.rootURL + '/Common/getAllStudentMediaPlans',
      { params: { userRoleId } }
    );
  }

  getSubscriptionPlansByID(id: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      this.rootURL + '/SlotTimeTable/getSubscriptionPlansByID',
      { params: { id } }
    );
  }

  getPrimaryDayCareID(CentreEmail: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      this.rootURL + '/DayCareCentreUser/getPrimaryCentreIdByEmail',
      { params: { CentreEmail } }
    );
  }

  getPrimaryDayCareList(centreID: any, type: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      this.rootURL + '/DayCareCentreUser/getPrimaryDayCareByCentreID',
      { params: { centreID, type } }
    );
  }

  sendMailPrimaryDaycareCentre(
    planEncryptID: any,
    dayCareUserEncryptID: any,
    CentreEmail: any,
    DayCareType: any
  ): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      this.rootURL + '/DayCareCentreUser/sendMailPrimaryDaycareCentre',
      {
        params: {
          planEncryptID,
          dayCareUserEncryptID,
          CentreEmail,
          DayCareType,
        },
      }
    );
  }

  primaryDaycareCentreRegistration(
    data: any,
    oldDayCareID: any
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      this.rootURL +
        '/DayCareCentreUser/managePrimaryDaycareCentreRegistration',
      data,
      { params: { oldDayCareID } }
    );
  }

  getTrialFreeDaycares(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      this.rootURL + '/DayCareCentreUser/getTrialPeriodDaycares'
    );
  }

  activateTrial(intresetedDayCareId: any, days: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootURL + '/DayCareCentreUser/activateTrial', {
      params: { intresetedDayCareId, days },
    });
  }
}
