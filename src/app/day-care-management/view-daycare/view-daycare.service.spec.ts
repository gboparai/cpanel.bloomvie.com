import { TestBed } from '@angular/core/testing';

import { ViewDaycareService } from './view-daycare.service';

describe('ViewDaycareService', () => {
  let service: ViewDaycareService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ViewDaycareService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
