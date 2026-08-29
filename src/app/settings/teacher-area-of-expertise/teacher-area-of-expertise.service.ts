import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TeacherAreaOfExpertiseService {
  private rootURL: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAreaOfExpertise(searchText:string): Observable<any> {
    return this.http.get<any>(`${this.rootURL}/User/GetAreaOfExpertise`,{params:{searchText}});
  }

  manageAreaOfExpertise(MasterAreaOfExpertise: any): Observable<any> {
    return this.http.post<any>(
      `${this.rootURL}/User/ManageAreaOfExpertise`,
      MasterAreaOfExpertise
    );
  }

  activeInActiveAreaOfExpertise(expertiseID: number): Observable<any> {
    return this.http.put<any>(
      `${this.rootURL}/User/ActiveInActiveAreaOfExpertise`,
      null,
      { params: { expertiseID } }
    );
  }
}
