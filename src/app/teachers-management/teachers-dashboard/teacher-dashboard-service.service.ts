import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class TeacherDashboardServiceService {

  rootUrl = environment.apiUrl;


  constructor(private http : HttpClient) { }


  getTeacherDashboardCount(userID:any,DaycareID:any)
  {
    return this.http.get(`${this.rootUrl}/Dashboard/getTeacherDashboardCount`,{params:{userID,DaycareID}});
  }

  getDayCareEventsByID(dayCareID:any) 
  {
    return this.http.get(`${this.rootUrl}/Dashboard/getEventsByDayCareId`,{params:{dayCareID}});
  }

  getDayCareActivities(dayCareID:any) 
  {
    return this.http.get(`${this.rootUrl}/Dashboard/getActivitesByCenterId`,{params:{dayCareID}});
  }

  getEmployeeJoiningDocuments(userID:any) 
  {
    return this.http.get(`${this.rootUrl}/Frontend/getEmployeeJoiningDocumentsByUserID`,{params:{userID}});
  }

  employeeJoiningDocuments(userID:any, letterAccepted:any, letterSignature:any, acceptanceIP:any) 
  {
    return this.http.get(`${this.rootUrl}/Frontend/manageEmployeeJoiningDocuments`,{params:{userID, letterAccepted, letterSignature, acceptanceIP}});
  }

  getAllEventManagementType(){
    return this.http.get(`${this.rootUrl}/Common/getAllEventManagementType`);
  }

  getDashboardPendingStudentAttandanceByuserId(userId:any,userRoleId:any,centreId:any,studentId:any):Observable<any>{
    return this.http.get(`${this.rootUrl}/Dashboard/getDashboardPendingStudentAttandanceByuserId`,{params: {userId,userRoleId,centreId,studentId}});
  }

  
  
}
