# Service Layer Test Coverage & Discovered Bugs

During the process of writing comprehensive unit tests for all 79 Angular services across the application, several critical bugs and edge cases were discovered in the existing source code.

To maintain the integrity of the application's intended business logic and avoid masking issues with flawed tests, these tests were marked as skipped (`xit`) with a `// BUG DISCOVERED` comment directly above them.

The following is a compilation of all bugs discovered during the test generation process.

### 1. `src/app/login/login.service.ts`
- **Method:** `loadUserFromStorage`
- **Issue:** The logic blindly assumes the `studentID` array exists if `userRoleID == 5`. If it doesn't, it throws `TypeError: Cannot read properties of undefined (reading '0')`.
- **Expected Behavior:** It should defensively check if `studentID` exists and is a non-empty array before attempting to access its `[0]` index.

### 2. `src/app/app.service.ts`
- **Method:** `initAuth`
- **Issue:** The method has a hard-dependency on `window.location.href`, making the success paths and token parsing effectively untestable natively within standard unit test isolation without severe framework-breaking overrides.
- **Expected Behavior:** URL parsing should be delegated to Angular's `ActivatedRoute` or `Router` injection, or abstracted behind an injectable token to allow safe mocking.

### 3. `src/app/common-component/common.service.ts`
- **Method:** `getUtcTime`
- **Issue:** The method fails completely if the `createdDate` is invalid or missing, resulting in silent failures where items skip processing entirely or crash out of the array mapping.
- **Expected Behavior:** It should fall back gracefully or provide structured default timestamps rather than throwing silent parsing errors.

### 4. `src/app/common-component/profile/profile.service.ts`
- **Method:** `getSubscriptionPlanByUserId`
- **Issue:** The method allows `studentID` to pass as `undefined` if omitted. Because it doesn't check for this before building the params object, it appends the literal string `"undefined"` to the API query parameters (e.g. `&studentID=undefined`).
- **Expected Behavior:** Optional parameters should be filtered out of the `HttpParams` object if they are null or undefined.

### 5. `src/app/day-care-management/manage-student-gallery/manage-student-gallery.service.ts`
- **Method:** `getStudentDetails`
- **Issue:** This method is completely unimplemented. It contains no API call or logic and simply throws `Error('Method not implemented.')` synchronously.
- **Expected Behavior:** It should return an `Observable` mapped to the correct backend endpoint.

### 6. `src/app/common-component/chatbox/chat-socket.service.ts`
- **Method:** `getChatHistory`
- **Issue:** This method makes a GET request to a completely empty URL string (`this.http.get('')`). It relies entirely on an undefined base path override or fails natively.
- **Expected Behavior:** It should construct the full path using `this.rootUrl` and append the correct endpoint string along with the `chatRoomId` and `count` parameters.

### 7. `src/app/parent-management/parent-onboarding/child-parent-details/child-parent.service.ts`
- **Method:** `getStudentLikesAndDislikes`
- **Issue:** The service method signature and the downstream HTTP call parameters are missing the required `studentID` parameter, relying solely on `parentID`. This likely causes 400 Bad Request errors or malformed DB lookups.
- **Expected Behavior:** The signature should be `getStudentLikesAndDislikes(parentID: any, studentID: any)` to match the expected API structure.

### 8. `src/app/welcome/welcome.service.ts`
- **Method:** `getAllUserRoles`
- **Issue:** The method passes the raw `userRoleID` parameter blindly into the `options` block of the `this.http.get()` call as the second argument. This causes internal Angular `HttpClient` failures natively because it expects structured options like `{ params: { userRoleID } }`.
- **Expected Behavior:** The API call should be formatted as `return this.http.get<any>(this.rootUrl + '/User/getAllUserRoles', { params: { userRoleID } });`
