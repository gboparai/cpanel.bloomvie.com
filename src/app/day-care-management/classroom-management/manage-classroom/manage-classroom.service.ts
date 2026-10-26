import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import {
  ApiResponse,
  AddClassroomRequest,
  ClassroomListResponse,
  DaycareSectionItem,
  DaycareDaysItem,
  MasterAgeGroupItem,
} from '../../../models/api.types';

@Injectable({
  providedIn: 'root',
})
export class ManageClassroomService {
  readonly rootUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  ManageClasses(formDataArray: AddClassroomRequest | Record<string, unknown>): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      this.rootUrl + '/Classroom/manageClasses',
      formDataArray
    );
  }

  editClass(id: number): Observable<ApiResponse<AddClassroomRequest>> {
    return this.http.get<ApiResponse<AddClassroomRequest>>(this.rootUrl + '/Classroom/getClassesByID', {
      params: { id },
    });
  }

  getSectionByClassID(classID: any): Observable<ApiResponse<DaycareSectionItem[]>> {
    return this.http.get<ApiResponse<DaycareSectionItem[]>>(this.rootUrl + '/Classroom/getSectionByClassID', {
      params: { classID },
    });
  }

  GetAllAgeGroup(CentreID: number): Observable<ApiResponse<MasterAgeGroupItem[]>> {
    return this.http.get<ApiResponse<MasterAgeGroupItem[]>>(
      this.rootUrl + '/Centre/getAllAgeGroupByCentreID',
      { params: { CentreID } }
    );
  }

  getClassListByDaycareID(daycareId: number, userRoleId: any, userId: any, searchText: string): Observable<ClassroomListResponse> {
    return this.http.get<ClassroomListResponse>(this.rootUrl + '/Classroom/getClassListByDaycareID', {
      params: { daycareId, userRoleId, userId, searchText },
    });
  }

  ActiveInactiveClassroom(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      this.rootUrl + '/Classroom/activeInactiveclassByID',
      { params: { id } }
    );
  }

  getAllDays(): Observable<ApiResponse<DaycareDaysItem[]>> {
    return this.http.get<ApiResponse<DaycareDaysItem[]>>(this.rootUrl + '/Classroom/getAllDays');
  }

  getClassTeacher(CentreID: any, ClassID: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + '/Centre/getTeacherByCenterID', {
      params: { CentreID, ClassID },
    });
  }
  onClassDuplicateCheck(centreID: any, className: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + '/Centre/onClassDuplicateCheck', {
      params: { centreID, className },
    });
  }
  checkSectionExists(sectionName: string, centreID: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.rootUrl + '/Centre/checkSectionExists', {
      params: { sectionName, centreID },
    });
  }

  getCentreWorkingDaysByCentreID(centreID: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      this.rootUrl + '/Centre/getCentreWorkingDaysByCentreID',
      { params: { centreID } }
    );
  }

  checkSlotExists(slotObj: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      this.rootUrl + '/Classroom/checkSlotExists',
      slotObj
    );
  }

  getClassroomCapacityByClassID(daycareID: number, inputCapacity: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      this.rootUrl + '/Classroom/getClassroomCapacityByClassID',
      { params: { daycareID, inputCapacity } }
    );
  }
}
