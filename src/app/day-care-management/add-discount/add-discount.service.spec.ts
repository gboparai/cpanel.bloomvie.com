import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AddDiscountService } from './add-discount.service';

describe('AddDiscountService', () => {
  let service: AddDiscountService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(AddDiscountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
