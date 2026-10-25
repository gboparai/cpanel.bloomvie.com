import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DaycareService {
  readonly URL = environment.apiUrl;
  private externalBillingSubject = new BehaviorSubject<boolean>(false);
  externalBilling$ = this.externalBillingSubject.asObservable();

  notifyExternalBillingChanged(enabled: boolean) {
    this.externalBillingSubject.next(enabled);
  }
  constructor(private http: HttpClient) {}

  getAllActivites(ActivityBO: any): Observable<any> {
    return this.http.post(this.URL + '/Classroom/getAllActivities', ActivityBO);
  }
  assignmentActivitesForDayCare(
    centerId: any,
    activityIds: number[],
    unselectedActivity: number[]
  ): Observable<any> {
    const requestBody = {
      CenterId: centerId,
      activityIds: activityIds, // This should be a list of integers
      unselectedActivity: unselectedActivity,
    };

    return this.http.post(
      this.URL + '/Common/assignmentActivitesForDayCare',
      requestBody
    );
  }

  assignFacilityForDayCare(
    centerId: any,
    facilityIds: number[],
    unselectedfacility: number[]
  ): Observable<any> {
    const requestBody = {
      CenterId: centerId,
      activityIds: facilityIds, // This should be a list of integers
      unselectedfacility: unselectedfacility,
    };

    return this.http.post(
      this.URL + '/Common/assignFacilityForDayCare',
      requestBody
    );
  }

  // removeClassRoomForDayCare(centerId:any,classRoomIdsToAdd:any,classRoomIdsToRemove:any)
  // {

  //   const requestBody = {
  //     centerId: centerId,
  //     classRoomAdd: classRoomIdsToAdd,
  //     classRoomIdsToRemove:classRoomIdsToRemove
  //   };
  //      return this.http.delete(this.URL+"/Common/removeClassRoomForDayCare",classRoomIdsToRemove,{params:{centerId,classRoomIdsToAdd}})
  // }

  // assignAgeGroupsForDayCare(
  //   centerId: any,
  //   ageGroupsIds: number[],
  // ): Observable<any> {
  //   const requestBody = {
  //     centerId: centerId,
  //     activityIds: ageGroupsIds, // This should be a list of integers
  //   };

  //   return this.http.post(
  //     this.URL + '/Common/assignAgeGroupsForDayCare',
  //     ageGroupsIds,{ params: { centerId } }
  //   );
  // }

  //Arsh
  assignAgeGroupsForDayCare(
    centerId: any,
    ageGroupsIds: number[],
    unselectedAgeGroup: number[]
  ): Observable<any> {
    const requestBody = {
      CenterId: centerId,
      AgeGroupIds: ageGroupsIds, // This should be a list of integers
      UnselectedAgeGroup: unselectedAgeGroup,
    };

    return this.http.post(
      this.URL + '/Common/assignAgeGroupsForDayCare',
      requestBody
    );
  }

  assignClassRoomForDayCare(
    CenterId: any,
    ClassRoomIds: number[],
    unselectedClass: number[]
  ): Observable<any> {
    const requestBody = {
      CenterId: CenterId,
      ClassRoomIds: ClassRoomIds,
      unselectedClass: unselectedClass,
    };

    return this.http.post(
      this.URL + '/Common/assignClassRoomForDayCare',
      requestBody
    );
  }

  // assignClassRoomForDayCare(
  //   centerId: any,
  //   classRoomIds: number[]
  // ): Observable<any> {
  //   const requestBody = {
  //     centerId: centerId,
  //     activityIds: classRoomIds,
  //   };

  //   return this.http.post(
  //     this.URL + '/Common/assignClassRoomForDayCare',
  //     classRoomIds,
  //     { params: { centerId } }
  //   );
  // }

  editDayCareSettings(centerId: any): Observable<any> {
    return this.http.get(this.URL + '/Common/GetDayCareSettingsByCenterID', {
      params: { centerId },
    });
  }

  getAllClasses(): Observable<any> {
    return this.http.get(this.URL + '/Classroom/getAllClasses');
  }

  getAllAgeGroup(): Observable<any> {
    return this.http.get(this.URL + '/Centre/getAllAgeGroups');
  }

  getAllFacility(): Observable<any> {
    return this.http.get(this.URL + '/Common/getAllFacility');
  }

  getCentreSettings(centreID: number): Observable<any> {
    return this.http.get(`${this.URL}/Centre/getCentreSettings`, {
      params: { centreID },
    });
  }

  updateCentreSettings(model: any): Observable<any> {
    return this.http.put(`${this.URL}/Centre/updateCentreSettings`, model);
  }

  checkExternalBilling(centreID: number): Observable<any> {
    return this.getCentreSettings(centreID).pipe(
      tap((res: any) => {
        if (res && res.result) {
          const enabled = !!(res.result.externalBillingEnabled ?? res.result.ExternalBillingEnabled ?? (typeof res.result === 'boolean' ? res.result : false));
          this.notifyExternalBillingChanged(enabled);
        }
      })
    );
  }
}
