import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ForgotPasswordService {

  private breadcrumbSubject = new BehaviorSubject<string>('');
  breadcrumb$ = this.breadcrumbSubject.asObservable();
  readonly URL = environment.apiUrl;
  private forgotUrl = '/Login/forgotPassword';

  constructor(private http: HttpClient) {}

  forgotPassword(email: any): Observable<any> {
    return this.http.get<any>(this.URL + this.forgotUrl,  {params:{email}} );
  }
setEmail(email:string)
{
  this.breadcrumbSubject.next(email);
}

}
