import { TestBed } from '@angular/core/testing';

import { AssignUserPermissionService } from './assign-user-permission.service';

describe('AssignUserPermissionService', () => {
  let service: AssignUserPermissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssignUserPermissionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
