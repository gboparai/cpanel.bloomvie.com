import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ViewDaycareService } from './view-daycare.service';

describe('ViewDaycareService', () => {
  let service: ViewDaycareService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ViewDaycareService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
