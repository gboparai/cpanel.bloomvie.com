import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ManageSchedulerService } from './manage-scheduler.service';

describe('ManageSchedulerService', () => {
  let service: ManageSchedulerService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ManageSchedulerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
