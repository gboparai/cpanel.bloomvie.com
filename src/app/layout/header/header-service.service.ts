import { Injectable, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HeaderServiceService {
  private notificationSubject = new BehaviorSubject<boolean>(true);
  public notification = this.notificationSubject.asObservable();
  rootUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}
  public switchProfile = signal(0);
  public newStudent = signal(0);
  triggerModal: WritableSignal<boolean> = signal<boolean>(false);

  triggerTermsAndCondition: WritableSignal<boolean> = signal(false);

  triggerEffect: WritableSignal<boolean> = signal<boolean>(false);

  public updateTriggerModal = (value: boolean) => this.triggerModal.set(value);

  public updateTriggerTermsAndCondition = () =>
    this.triggerTermsAndCondition.set(true);

  CheckParentOnboarding(UserID: number): Observable<any> {
    return this.http.get<any>(
      this.rootUrl + '/DayCareCentreUser/CheckParentOnboarding',
      { params: { UserID } }
    );
  }

  onReceivedNotification() {
    this.notificationSubject.next(true);
  }

  getAllStudentsByParentID(parentID: number): Observable<any> {
    return this.http.get<any>(
      this.rootUrl + '/Common/getAllStudentsByParentID',
      { params: { parentID } }
    );
  }

  CheckStudentSubscriptionPayment(
    parentId: any,
    userRoleId: any,
    studentId: any,
    centreId: any
  ): Observable<any> {
    return this.http.get<any>(
      this.rootUrl + '/Login/CheckStudentSubscriptionPaymentByParentId',
      { params: { parentId, userRoleId, studentId, centreId } }
    );
  }

  checkStudentOnboardingCompleteOrNotByStudentID(
    StudentID: number
  ): Observable<any> {
    return this.http.get<any>(
      `${this.rootUrl}/DayCareCentreUser/checkStudentOnboardingCompleteOrNotByStudentID`,
      { params: { StudentID } }
    );
  }

  generateExpressLoginLink(connectedAccountId: string): Observable<any> {
    return this.http.post<any>(
      this.rootUrl + '/Payment/express-login-link',
      {},
      { params: { connectedAccountId } }
    );
  }
}
