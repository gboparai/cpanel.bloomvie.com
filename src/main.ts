import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { AppService } from './app/app.service';
import { authInterceptor } from './app/auth/auth.interceptor';
import { APP_INITIALIZER, importProvidersFrom } from '@angular/core';

function appInitFactory(authService: AppService) {
  return () => authService.initAuth();
}

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideHttpClient(withInterceptors([authInterceptor])),
    {
      provide: APP_INITIALIZER,
      useFactory: appInitFactory,
      deps: [AppService],
      multi: true,
    },
  ],
}).catch((err) => console.error(err));
