import { TestBed } from '@angular/core/testing';

import { ManageMasterLeaveService } from './manage-master-leave.service';

describe('ManageMasterLeaveService', () => {
  let service: ManageMasterLeaveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageMasterLeaveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
