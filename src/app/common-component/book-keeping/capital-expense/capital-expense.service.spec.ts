import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { CapitalExpenseService } from './capital-expense.service';

describe('CapitalExpenseService', () => {
  let service: CapitalExpenseService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(CapitalExpenseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
