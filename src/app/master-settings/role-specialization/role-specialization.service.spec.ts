import { TestBed } from '@angular/core/testing';

import { RoleSpecializationService } from './role-specialization.service';

describe('RoleSpecializationService', () => {
  let service: RoleSpecializationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoleSpecializationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
