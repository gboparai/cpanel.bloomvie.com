import { TestBed } from '@angular/core/testing';

import { ManageSchedulerService } from './manage-scheduler.service';

describe('ManageSchedulerService', () => {
  let service: ManageSchedulerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageSchedulerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
