import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { SocialLinksService } from './social-links.service';

describe('SocialLinksService', () => {
  let service: SocialLinksService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(SocialLinksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
