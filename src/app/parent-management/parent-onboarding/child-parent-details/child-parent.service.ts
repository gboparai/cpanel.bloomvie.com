import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChildParentService {
  readonly URL = environment.apiUrl;
  constructor(private http: HttpClient) {}
  CheckInterestedMobileExist(mobile: any): Observable<any> {
    return this.http.get<any>(this.URL + '/User/CheckInterestedMobileExist', {
      params: { mobile },
    });
  }
  manageDetail(basicDetailForm: any): Observable<any> {
    return this.http.post<any>(
      this.URL + '/DayCareCentreUser/parentStudent',
      basicDetailForm
    );
  }

  GetAllAgeGroup(CentreID: number): Observable<any> {
    return this.http.get<any>(this.URL + '/Centre/getAllAgeGroupByCentreID', {
      params: { CentreID },
    });
  }

  getLocationData(postalCode: string): Observable<any> {
    const url = `http://api.zippopotam.us/CA/${postalCode.replace(/\s+/g, '')}`;
    return this.http.get<any>(url);
  }

  getStudentParentDetailsByParentID(
    parentID: number,
    studentID: number
  ): Observable<any> {
    return this.http.get<any>(
      this.URL + '/DayCareCentreUser/getStudentParentDetailsByParentID',
      { params: { parentID, studentID } }
    );
  }

  getStudentLikesAndDislikes(parentID: any): Observable<any> {
    return this.http.get(
      this.URL + '/DayCareCentreUser/getStudentLikesAndDislikes',
      { params: { parentID } }
    );
  }
}
