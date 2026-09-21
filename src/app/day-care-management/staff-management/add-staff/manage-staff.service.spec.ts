import { TestBed } from '@angular/core/testing';

import { ManageStaffService } from './manage-staff.service';

describe('ManageStaffService', () => {
  let service: ManageStaffService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageStaffService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
