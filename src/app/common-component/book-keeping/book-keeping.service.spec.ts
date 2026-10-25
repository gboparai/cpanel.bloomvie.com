import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { BookKeepingService } from './book-keeping.service';

describe('BookKeepingService', () => {
  let service: BookKeepingService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(BookKeepingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
