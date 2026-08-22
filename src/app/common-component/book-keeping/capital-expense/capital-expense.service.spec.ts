import { TestBed } from '@angular/core/testing';

import { CapitalExpenseService } from './capital-expense.service';

describe('CapitalExpenseService', () => {
  let service: CapitalExpenseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CapitalExpenseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
