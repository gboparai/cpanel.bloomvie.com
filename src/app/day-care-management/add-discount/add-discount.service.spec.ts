import { TestBed } from '@angular/core/testing';

import { AddDiscountService } from './add-discount.service';

describe('AddDiscountService', () => {
  let service: AddDiscountService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddDiscountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
