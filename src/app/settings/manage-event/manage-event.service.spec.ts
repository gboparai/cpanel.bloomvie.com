import { TestBed } from '@angular/core/testing';

import { ManageEventService } from './manage-event.service';

describe('ManageEventService', () => {
  let service: ManageEventService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageEventService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
