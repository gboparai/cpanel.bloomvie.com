# Technical Debt & Architecture Backlog

## 1. Strong TypeScript Typing for API Requests & Responses
- **Location:** `src/app/parent-management/parent-dashboard/parent-dashboard.component.ts`, `src/app/layout/header/header-service.service.ts`, and related services.
- **Problem:** Widespread usage of `any` types in subscription callbacks (e.g. `next: (authResponse: { result: any; }) => ...`) undermines compile-time type safety and IntelliSense.
- **Tasks:**
  - [ ] Define shared TypeScript models/DTOs matching backend `ApiResponse` structures:
    - `interface StudentSubscriptionCheckResult { isSubscribed: boolean; planDetail?: PlanDetail; ... }`
    - `interface CentreSettingsResult { externalBillingEnabled: boolean; centreName: string; ... }`
  - [ ] Replace `any` parameters in service method signatures and RxJS observables with their corresponding typed interfaces.
  - [ ] Add strict type guards for API error responses.

## 2. Reusable SVG Icon Component / Sprite System
- **Location:** `src/app/settings/general-setting/general-setting.component.html`, toggle switches, and status indicators across the app.
- **Problem:** Toggle switches and status icons currently embed raw inline SVG markup (`<svg class="cross" ...>`), leading to markup duplication.
- **Tasks:**
  - [ ] Create a standalone `<app-icon>` or SVG sprite system (`assets/icons/sprite.svg`).
  - [ ] Support color, size, and animation state via component inputs without breaking CSS transition rules on `.slider .circle .cross`.
  - [ ] Migrate settings toggle switches and action buttons to use the unified icon component.
