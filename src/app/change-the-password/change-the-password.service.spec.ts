import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ChangeThePasswordService } from './change-the-password.service';

describe('ChangeThePasswordService', () => {
  let service: ChangeThePasswordService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ChangeThePasswordService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
