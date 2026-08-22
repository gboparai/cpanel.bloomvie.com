import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { catchError, throwError, switchMap } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';


export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.headers.get('No-Auth') == 'True') {
    return next(req);
  }


  const cookieService = inject(CookieService);
  const http = inject(HttpClient);
  let tokenString = cookieService.get('UserInfo');
  if (tokenString) {
    try {
      const userInfoJson = JSON.parse(tokenString);
      const authToken = JSON.parse(tokenString).token;
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`,
          userId: '5',
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          Pragma: 'no-cache',
          Expires: '0',
        },

        params: req.params.set('_', Date.now().toString()),
      });

      return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            const refreshToken = JSON.parse(tokenString).refreshToken;
            const accessToken = JSON.parse(tokenString).token;
            if (!refreshToken) {
              return throwError(() => error);
            }
            if (!accessToken) {
              return throwError(() => error);
            }

            return http
              .get<any>(`${environment.apiUrl}/Login/generateNewAccessToken`, {
                params: {
                  refreshToken: refreshToken,
                  accessToken: accessToken,
                }
              })
              .pipe(
                switchMap((response: any) => {
                  // Save new token
                  const jwtToken = response.token;
                  userInfoJson.result.token = jwtToken;
                  userInfoJson.token = jwtToken;
                  const convertToString = JSON.stringify(userInfoJson);
                  cookieService.set('UserInfo', convertToString);

                  // Retry the original request with new token
                  const newReq = req.clone({
                    setHeaders: {
                      Authorization: `Bearer ${response.token}`,
                    },
                  });

                  return next(newReq);
                }),
                catchError((refreshError) => {
                  console.error('Refresh token failed', refreshError);
                  return throwError(() => refreshError);
                })
              );
          }

          return throwError(() => error);
        }));

      // return next(authReq).pipe(catchError(handleError));
    } catch (error) {
      return next(req).pipe(catchError(handleError));
    }
  }
  return next(req).pipe(catchError(handleError));
};

const handleError = (error: HttpErrorResponse) => {
  return throwError(() => {
    if (error?.status === 0) {
      return { message: 'Server not responding. Please try again later.' };
    }

    return error?.error || { message: error.message };

  });
};
