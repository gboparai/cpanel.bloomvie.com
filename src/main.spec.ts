// We MUST spy on console.error BEFORE main.ts is imported and executed
const originalConsoleError = console.error;
let caughtBootstrapError: any = null;
console.error = (...args: any[]) => {
    // Check if it's the specific error we expect from bootstrap failure
    if (args[0] && args[0].message && args[0].message.includes('app-root')) {
        caughtBootstrapError = args[0];
    } else {
        originalConsoleError(...args);
    }
};

import { appInitFactory } from './main';
import { AppService } from './app/app.service';

describe('main.ts', () => {
  afterAll(() => {
      console.error = originalConsoleError;
  });

  describe('appInitFactory', () => {
    it('should return a function that calls initAuth on the AppService', () => {
      const mockAuthService = jasmine.createSpyObj('AppService', ['initAuth']);
      const initFn = appInitFactory(mockAuthService);

      expect(typeof initFn).toBe('function');

      initFn();
      expect(mockAuthService.initAuth).toHaveBeenCalled();
    });
  });

  describe('bootstrapApplication catch block', () => {
      it('should log an error to console if bootstrapApplication fails', () => {
          // Because main.ts has already been imported and executed at the top of the file,
          // and because there is no <app-root> in the test DOM, it fails with NG05104.
          // This executes the .catch block in main.ts, which calls console.error.
          // We captured this in caughtBootstrapError.

          expect(caughtBootstrapError).toBeTruthy();
          expect(caughtBootstrapError.message).toContain('The selector "app-root" did not match any elements');
      });
  });
});
