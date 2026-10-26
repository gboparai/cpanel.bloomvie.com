import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ManageEventService } from './manage-event.service';

describe('ManageEventService', () => {
  let service: ManageEventService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ManageEventService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
