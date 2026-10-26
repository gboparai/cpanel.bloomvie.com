import { Injectable, signal, WritableSignal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, ClassroomDropdownItem, DaycareEventItem } from '../../models/api.types';

@Injectable({
  providedIn: 'root',
})
export class DayCareDashboardService {
  private readonly URL: string = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getDayCareByID(ID: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + '/Centre/getCentreByID', {
      params: { ID },
    });
  }
  getDayCareDashBoardCount(DayCareID: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + '/Dashboard/getDayCareDashBoardCount', {
      params: { DayCareID },
    });
  }

  getEventsByDayCareId(DayCareId: any): Observable<ApiResponse<DaycareEventItem[]>> {
    return this.http.get<ApiResponse<DaycareEventItem[]>>(this.URL + '/Dashboard/getEventsByDayCareId', {
      params: { DayCareId },
    });
  }

  getActivitesByCenterId(DayCareId: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + '/Dashboard/getActivitesByCenterId', {
      params: { DayCareId },
    });
  }

  getStaffTransferedDetailsByCentreID(
    centreID: number,
    UserRoleID: number,
    status: any,
    type: any
  ): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      this.URL + '/Common/getStaffTransferedDetailsByCentreID',
      { params: { centreID, UserRoleID, status, type } }
    );
  }

  getStaffTransferedDetailsTeacherID(
    teacherID: number,
    UserRoleID: number
  ): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
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
  ): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + '/Common/manageTransferApprovedEmployee', {
      params: { employeeID, transferCentreID, statusID, Reason, date },
    });
  }

  getAllEventManagementType(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + '/Common/getAllEventManagementType');
  }

  manageDaycareCentreEventManagment(payload: DaycareEventItem | any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.URL}/Common/ManageDaycareCentreEventManagment`,
      payload
    );
  }

  deleteEvent(eventID: any, daycareID: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.URL + '/Common/deleteEventByDayCareId', {
      params: { eventID, daycareID },
    });
  }

  getAllEnrollmentRequestByCentreID(
    CentreID: number,
    IsDiscountApplied: boolean,
    searchItem: string
  ): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.URL}/DayCareCentreUser/getAllEnrollmentRequestByCentreID`,
      { params: { CentreID, IsDiscountApplied, searchItem } }
    );
  }

  getClassListDropdownByAgeGroup(
    CentreID: number,
    AgeGroupID: number
  ): Observable<ApiResponse<ClassroomDropdownItem[]>> {
    return this.http.get<ApiResponse<ClassroomDropdownItem[]>>(
      `${this.URL}/Classroom/getClassListDropdownByAgeGroup`,
      { params: { CentreID, AgeGroupID } }
    );
  }

  AcceptOrRejectEnrollmentRequest(
    AcceptOrRejct: any[],
    StatusID: number,
    Reason: string,
    ParentID: number
  ): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.URL}/DayCareCentreUser/AcceptOrRejectEnrollmentRequest`,
      AcceptOrRejct,
      { params: { StatusID, Reason, ParentID } }
    );
  }

  sendPaymentEmailToParent(paymentDetails: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.URL}/DayCareCentreUser/sendPaymentEmailToParent`,
      paymentDetails
    );
  }

  updateStripeStepCount(accountId: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.URL}/Payment/updateStripeStepCount`,
      null,
      { params: { accountId } }
    );
  }
}
