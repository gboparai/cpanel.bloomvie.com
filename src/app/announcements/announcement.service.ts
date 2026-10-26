import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ApiResponse,
  AnnouncementItem,
  CreateAnnouncementRequest,
  RecipientAnnouncementItem,
  ClassroomDropdownItem,
} from '../models/api.types';

export { ClassroomDropdownItem };

@Injectable({
  providedIn: 'root',
})
export class AnnouncementService {
  readonly rootUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createAnnouncement(payload: CreateAnnouncementRequest | any): Observable<ApiResponse<AnnouncementItem>> {
    return this.http.post<ApiResponse<AnnouncementItem>>(`${this.rootUrl}/Announcement/CreateAnnouncement`, payload);
  }

  getAnnouncementHistory(userId: number, userRoleId: number, centreId?: number): Observable<ApiResponse<AnnouncementItem[]>> {
    return this.http.get<ApiResponse<AnnouncementItem[]>>(`${this.rootUrl}/Announcement/GetAnnouncementHistory`, {
      params: { userId, userRoleId, ...(centreId ? { centreId } : {}) }
    });
  }

  getRecipientAnnouncements(userId: number, userRoleId: number, studentId?: number | null, centreId?: number | null): Observable<ApiResponse<RecipientAnnouncementItem[]>> {
    return this.http.get<ApiResponse<RecipientAnnouncementItem[]>>(`${this.rootUrl}/Announcement/GetRecipientAnnouncements`, {
      params: { 
        userId, 
        userRoleId, 
        ...(studentId ? { studentId } : {}), 
        ...(centreId ? { centreId } : {}) 
      }
    });
  }

  getDaycareClassListDropdown(id: number = 0): Observable<ApiResponse<ClassroomDropdownItem[]>> {
    return this.http.get<ApiResponse<ClassroomDropdownItem[]>>(`${this.rootUrl}/Classroom/getDaycareClassListDropdown`, {
      params: { id }
    });
  }

  getClassRoom(centreID: number, teacherID: number, userRoleID: number): Observable<ApiResponse<ClassroomDropdownItem[]>> {
    return this.http.get<ApiResponse<ClassroomDropdownItem[]>>(`${this.rootUrl}/Classroom/getClassRoom`, {
      params: { centreID, teacherID, userRoleID }
    });
  }

  getClassListByDaycareID(daycareId: number, userRoleId: any, userId: any, searchText: string = ''): Observable<ApiResponse<ClassroomDropdownItem[]>> {
    return this.http.get<ApiResponse<ClassroomDropdownItem[]>>(`${this.rootUrl}/Classroom/getClassListByDaycareID`, {
      params: { daycareId, userRoleId, userId, searchText }
    });
  }
}
