import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AssignUserPermissionService } from './assign-user-permission.service';

describe('AssignUserPermissionService', () => {
  let service: AssignUserPermissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(AssignUserPermissionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
