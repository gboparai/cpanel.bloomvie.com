import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';


import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { authInterceptor } from './auth/auth.interceptor';
import { provideNgxStripe } from 'ngx-stripe';
import { routes } from './app.routes';
import { environment } from '../environments/environment';

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
  provideNgxStripe(environment.stripePublishableKey)
  ]
};
