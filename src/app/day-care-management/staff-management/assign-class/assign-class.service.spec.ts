import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AssignClassService } from './assign-class.service';

describe('AssignClassService', () => {
  let service: AssignClassService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(AssignClassService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
