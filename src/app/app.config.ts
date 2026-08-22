import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';


import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { authInterceptor } from './auth/auth.interceptor';
import { provideNgxStripe } from 'ngx-stripe';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideClientHydration(), provideHttpClient(withInterceptors([authInterceptor])),
  provideAnimations(), provideToastr(
    {
      progressBar: true,
      preventDuplicates: true,
      maxOpened: 1,
      autoDismiss: true,
      timeOut:3000
    }),
  provideNgxStripe('pk_test_51REatbADi5PePYyrsmnVeBawb0mtDjznD0DmlvFlejvJ0cZGJjc1CohNZdc3Dw0UovQyD2vMlU8vZ1BtPAsyqEFg00tYNBrGlb')
  ]
};
