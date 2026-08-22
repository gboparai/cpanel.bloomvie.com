import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  ): Observable<any> {
    return this.http.get<any>(
      this.rootURL + '/SlotTimeTable/getRescheduleOrCompleteDayCareList',
      { params: { statusID, searchItem, regionHours, regionMinutes } }
    );
  }

  rescheduleMeeting(rescheduleForm: any): Observable<any> {
    return this.http.post<any>(
      this.rootURL + '/SlotTimeTable/rescheduledayCareMeeting',
      rescheduleForm
    );
  }

  getPlansForDaycare(userRoleId: number): Observable<any> {
    return this.http.get<any>(this.rootURL + '/Common/getAllPlans', {
      params: { userRoleId },
    });
  }

  getAllStudentMediaPlans(userRoleId: number): Observable<any> {
    return this.http.get<any>(
      this.rootURL + '/Common/getAllStudentMediaPlans',
      { params: { userRoleId } }
    );
  }

  getSubscriptionPlansByID(id: any): Observable<any> {
    return this.http.get<any>(
      this.rootURL + '/SlotTimeTable/getSubscriptionPlansByID',
      { params: { id } }
    );
  }

  getPrimaryDayCareID(CentreEmail: any): Observable<any> {
    return this.http.get<any>(
      this.rootURL + '/DayCareCentreUser/getPrimaryCentreIdByEmail',
      { params: { CentreEmail } }
    );
  }

  getPrimaryDayCareList(centreID: any, type: any): Observable<any> {
    return this.http.get<any>(
      this.rootURL + '/DayCareCentreUser/getPrimaryDayCareByCentreID',
      { params: { centreID, type } }
    );
  }

  sendMailPrimaryDaycareCentre(
    planEncryptID: any,
    dayCareUserEncryptID: any,
    CentreEmail: any,
    DayCareType: any
  ): Observable<any> {
    return this.http.get<any>(
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
  ): Observable<any> {
    return this.http.post<any>(
      this.rootURL +
        '/DayCareCentreUser/managePrimaryDaycareCentreRegistration',
      data,
      { params: { oldDayCareID } }
    );
  }

  getTrialFreeDaycares(): Observable<any> {
    return this.http.get(
      this.rootURL + '/DayCareCentreUser/getTrialPeriodDaycares'
    );
  }

  activateTrial(intresetedDayCareId: any, days: any): Observable<any> {
    return this.http.get(this.rootURL + '/DayCareCentreUser/activateTrial', {
      params: { intresetedDayCareId, days },
    });
  }
}
