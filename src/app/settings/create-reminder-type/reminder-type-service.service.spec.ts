import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ReminderTypeServiceService } from './reminder-type-service.service';

describe('ReminderTypeServiceService', () => {
  let service: ReminderTypeServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ReminderTypeServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
