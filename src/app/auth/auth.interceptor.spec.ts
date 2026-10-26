import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHandlerFn,
  HttpRequest,
  HttpResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { CookieService } from 'ngx-cookie-service';
import { of, throwError } from 'rxjs';
import { authInterceptor } from './auth.interceptor';
import { environment } from '../../environments/environment';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let cookieServiceSpy: jasmine.SpyObj<CookieService>;

  beforeEach(() => {
    cookieServiceSpy = jasmine.createSpyObj('CookieService', ['get', 'set']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: CookieService, useValue: cookieServiceSpy },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('bypasses authentication when No-Auth header is True', () => {
    http.get('/api/public-endpoint', { headers: { 'No-Auth': 'True' } }).subscribe();

    const req = httpMock.expectOne('/api/public-endpoint');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({ success: true });
  });

  it('attaches Authorization Bearer token and cache-control headers when UserInfo cookie is present', () => {
    const userInfo = {
      token: 'valid-jwt-token-123',
      refreshToken: 'valid-refresh-token-456',
      result: { token: 'valid-jwt-token-123' },
    };
    cookieServiceSpy.get.and.returnValue(JSON.stringify(userInfo));

    http.get('/api/protected-resource').subscribe();

    const req = httpMock.expectOne(request => request.url === '/api/protected-resource');
    expect(req.request.headers.get('Authorization')).toBe('Bearer valid-jwt-token-123');
    expect(req.request.headers.get('userId')).toBe('5');
    expect(req.request.headers.get('Pragma')).toBe('no-cache');
    expect(req.request.params.has('_')).toBeTrue();
    req.flush({ success: true });
  });

  it('proceeds without Authorization header when UserInfo cookie is not present', () => {
    cookieServiceSpy.get.and.returnValue('');

    http.get('/api/anonymous-resource').subscribe();

    const req = httpMock.expectOne('/api/anonymous-resource');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({ success: true });
  });

  it('handles 401 error by requesting new access token and retrying original request', () => {
    const userInfo = {
      token: 'expired-token',
      refreshToken: 'valid-refresh-token',
      result: { token: 'expired-token' },
    };
    cookieServiceSpy.get.and.returnValue(JSON.stringify(userInfo));

    let finalResponse: any;
    http.get('/api/data').subscribe(res => {
      finalResponse = res;
    });

    // 1. Initial request fails with 401
    const initialReq = httpMock.expectOne(req => req.url === '/api/data');
    expect(initialReq.request.headers.get('Authorization')).toBe('Bearer expired-token');
    initialReq.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    // 2. Interceptor triggers refresh token endpoint
    const refreshReq = httpMock.expectOne(
      req => req.url === `${environment.apiUrl}/Login/generateNewAccessToken` &&
             req.params.get('refreshToken') === 'valid-refresh-token' &&
             req.params.get('accessToken') === 'expired-token'
    );
    expect(refreshReq.request.method).toBe('GET');
    refreshReq.flush({ token: 'new-fresh-token' });

    // 3. UserInfo cookie is updated with new token
    expect(cookieServiceSpy.set).toHaveBeenCalled();

    // 4. Original request is retried with new Bearer token
    const retriedReq = httpMock.expectOne(req => req.url === '/api/data');
    expect(retriedReq.request.headers.get('Authorization')).toBe('Bearer new-fresh-token');
    retriedReq.flush({ data: 'success after refresh' });

    expect(finalResponse).toEqual({ data: 'success after refresh' });
  });

  it('propagates error when 401 occurs and refreshToken is missing', () => {
    const userInfo = {
      token: 'expired-token',
      result: {},
    };
    cookieServiceSpy.get.and.returnValue(JSON.stringify(userInfo));

    let receivedError: any;
    http.get('/api/data').subscribe({
      error: err => {
        receivedError = err;
      },
    });

    const req = httpMock.expectOne(r => r.url === '/api/data');
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(receivedError.status).toBe(401);
  });

  it('formats server not responding message when error status is 0', () => {
    cookieServiceSpy.get.and.returnValue('');

    let receivedError: any;
    http.get('/api/timeout').subscribe({
      error: err => {
        receivedError = err;
      },
    });

    const req = httpMock.expectOne('/api/timeout');
    req.error(new ProgressEvent('Network error'), { status: 0 });

    expect(receivedError.message).toBe('Server not responding. Please try again later.');
  });
});
