import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { HeaderServiceService } from './header-service.service';

describe('HeaderServiceService', () => {
  let service: HeaderServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(HeaderServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
