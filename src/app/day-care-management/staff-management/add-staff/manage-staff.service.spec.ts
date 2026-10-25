import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ManageStaffService } from './manage-staff.service';

describe('ManageStaffService', () => {
  let service: ManageStaffService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ManageStaffService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
