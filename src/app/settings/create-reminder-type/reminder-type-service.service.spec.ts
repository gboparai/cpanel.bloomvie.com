import { TestBed } from '@angular/core/testing';

import { ReminderTypeServiceService } from './reminder-type-service.service';

describe('ReminderTypeServiceService', () => {
  let service: ReminderTypeServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReminderTypeServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
