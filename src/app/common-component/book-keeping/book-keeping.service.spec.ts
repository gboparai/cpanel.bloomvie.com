import { TestBed } from '@angular/core/testing';

import { BookKeepingService } from './book-keeping.service';

describe('BookKeepingService', () => {
  let service: BookKeepingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookKeepingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
