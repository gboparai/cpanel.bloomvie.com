import { TestBed } from '@angular/core/testing';

import { SuuplyService } from './suuply.service';

describe('SuuplyService', () => {
  let service: SuuplyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SuuplyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
