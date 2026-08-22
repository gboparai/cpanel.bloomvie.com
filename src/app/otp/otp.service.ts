import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class OtpService {
  readonly URL = environment.apiUrl
  private otpUrl='/Login/verifyOTP';

  constructor(private http: HttpClient) {}
  
  verifyOTP(otp: string,email:string): Observable<any> {
    return this.http.post(this.URL+ this.otpUrl,{otp,email});
  }

  
}