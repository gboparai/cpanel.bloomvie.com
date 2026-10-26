import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, AreaOfExpertiseItem } from '../../models/api.types';

@Injectable({
  providedIn: 'root',
})
export class TeacherAreaOfExpertiseService {
  private rootURL: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAreaOfExpertise(searchText: string): Observable<ApiResponse<AreaOfExpertiseItem[]>> {
    return this.http.get<ApiResponse<AreaOfExpertiseItem[]>>(`${this.rootURL}/User/GetAreaOfExpertise`, { params: { searchText } });
  }

  manageAreaOfExpertise(MasterAreaOfExpertise: AreaOfExpertiseItem | any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.rootURL}/User/ManageAreaOfExpertise`,
      MasterAreaOfExpertise
    );
  }

  activeInActiveAreaOfExpertise(expertiseID: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.rootURL}/User/ActiveInActiveAreaOfExpertise`,
      null,
      { params: { expertiseID } }
    );
  }
}
