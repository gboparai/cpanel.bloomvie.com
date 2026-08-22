import { TestBed } from '@angular/core/testing';

import { ManageDaycareService } from './manage-daycare.service';

describe('ManageDaycareService', () => {
  let service: ManageDaycareService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageDaycareService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
