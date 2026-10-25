import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AnnouncementService {
  readonly rootUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createAnnouncement(payload: any): Observable<any> {
    return this.http.post<any>(`${this.rootUrl}/Announcement/CreateAnnouncement`, payload);
  }

  getAnnouncementHistory(userId: any, userRoleId: any, centreId?: any): Observable<any> {
    return this.http.get<any>(`${this.rootUrl}/Announcement/GetAnnouncementHistory`, {
      params: { userId, userRoleId, ...(centreId ? { centreId } : {}) }
    });
  }

  getRecipientAnnouncements(userId: any, userRoleId: any, studentId?: any, centreId?: any): Observable<any> {
    return this.http.get<any>(`${this.rootUrl}/Announcement/GetRecipientAnnouncements`, {
      params: { 
        userId, 
        userRoleId, 
        ...(studentId ? { studentId } : {}), 
        ...(centreId ? { centreId } : {}) 
      }
    });
  }

  getDaycareClassListDropdown(id: number = 0): Observable<any> {
    return this.http.get<any>(`${this.rootUrl}/Classroom/getDaycareClassListDropdown`, {
      params: { id }
    });
  }

  getClassRoom(centreID: number, teacherID: number, userRoleID: number): Observable<any> {
    return this.http.get<any>(`${this.rootUrl}/Classroom/getClassRoom`, {
      params: { centreID, teacherID, userRoleID }
    });
  }

  getClassListByDaycareID(daycareId: number, userRoleId: any, userId: any, searchText: string = ''): Observable<any> {
    return this.http.get<any>(`${this.rootUrl}/Classroom/getClassListByDaycareID`, {
      params: { daycareId, userRoleId, userId, searchText }
    });
  }
}
