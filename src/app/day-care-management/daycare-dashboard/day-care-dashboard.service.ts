import { Injectable, signal, WritableSignal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DayCareDashboardService {
  private readonly URL: string = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getDayCareByID(ID: any): Observable<any> {
    return this.http.get(this.URL + '/Centre/getCentreByID', {
      params: { ID },
    });
  }
  getDayCareDashBoardCount(DayCareID: any): Observable<any> {
    return this.http.get(this.URL + '/Dashboard/getDayCareDashBoardCount', {
      params: { DayCareID },
    });
  }

  getEventsByDayCareId(DayCareId: any): Observable<any> {
    return this.http.get(this.URL + '/Dashboard/getEventsByDayCareId', {
      params: { DayCareId },
    });
  }

  getActivitesByCenterId(DayCareId: any): Observable<any> {
    return this.http.get(this.URL + '/Dashboard/getActivitesByCenterId', {
      params: { DayCareId },
    });
  }

  getStaffTransferedDetailsByCentreID(
    centreID: number,
    UserRoleID: number,
    status: any,
    type: any
  ): Observable<any> {

    return this.http.get(
      this.URL + '/Common/getStaffTransferedDetailsByCentreID',
      { params: { centreID, UserRoleID, status, type } }
    );
  }

  getStaffTransferedDetailsTeacherID(
    teacherID: number,
    UserRoleID: number
  ): Observable<any> {
  
    return this.http.get(
      this.URL + '/Common/getStaffTransferedDetailsTeacherID',
      { params: { teacherID, UserRoleID } }
    );
  }

  manageTransferApprovedEmployee(
    employeeID: any,
    transferCentreID: any,
    statusID: any,
    Reason: any,
    date: any
  ): Observable<any> {

    return this.http.get(this.URL + '/Common/manageTransferApprovedEmployee', {
      params: { employeeID, transferCentreID, statusID, Reason, date },
    });
  }

  getAllEventManagementType() {
    return this.http.get(this.URL + '/Common/getAllEventManagementType');
  }

  manageDaycareCentreEventManagment(payload: any) {
    return this.http.post(
      `${this.URL}/Common/ManageDaycareCentreEventManagment`,
      payload
    );
  }

  deleteEvent(eventID: any, daycareID: any): Observable<any> {
    return this.http.get(this.URL + '/Common/deleteEventByDayCareId', {
      params: { eventID, daycareID },
    });
  }

  getAllEnrollmentRequestByCentreID(
    CentreID: number,
    IsDiscountApplied: boolean,
    searchItem: string
  ): Observable<any> {
    return this.http.get(
      `${this.URL}/DayCareCentreUser/getAllEnrollmentRequestByCentreID`,
      { params: { CentreID, IsDiscountApplied, searchItem } }
    );
  }

  getClassListDropdownByAgeGroup(
    CentreID: number,
    AgeGroupID: number
  ): Observable<any> {
    return this.http.get<any>(
      `${this.URL}/Classroom/getClassListDropdownByAgeGroup`,
      { params: { CentreID, AgeGroupID } }
    );
  }

  AcceptOrRejectEnrollmentRequest(
    AcceptOrRejct: any[],
    StatusID: number,
    Reason: string,
    ParentID: number
  ): Observable<any> {
    return this.http.put<any>(
      `${this.URL}/DayCareCentreUser/AcceptOrRejectEnrollmentRequest`,
      AcceptOrRejct,
      { params: { StatusID, Reason, ParentID } }
    );
  }

  sendPaymentEmailToParent(paymentDetails: any): Observable<any> {
    return this.http.put<any>(
      `${this.URL}/DayCareCentreUser/sendPaymentEmailToParent`,
      paymentDetails
    );
  }

  updateStripeStepCount(accountId: string): Observable<any> {
    return this.http.put<any>(
      `${this.URL}/Payment/updateStripeStepCount`,
      null,
      { params: { accountId } }
    );
  }
}
