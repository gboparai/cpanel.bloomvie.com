import { TestBed } from '@angular/core/testing';

import { TocRegistrationService } from './toc-registration.service';

describe('TocRegistrationService', () => {
  let service: TocRegistrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TocRegistrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
