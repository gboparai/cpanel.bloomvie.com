import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, VerifyOtpResult } from '../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class OtpService {
  readonly URL = environment.apiUrl;
  private otpUrl = '/Login/verifyOTP';

  constructor(private http: HttpClient) {}
  
  verifyOTP(otp: string, email: string): Observable<ApiResponse<VerifyOtpResult>> {
    return this.http.post<ApiResponse<VerifyOtpResult>>(this.URL + this.otpUrl, { otp, email });
  }
}
