import { TestBed } from '@angular/core/testing';

import { AssignClassService } from './assign-class.service';

describe('AssignClassService', () => {
  let service: AssignClassService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssignClassService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
