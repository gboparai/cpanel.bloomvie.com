import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ManageDaycareService } from './manage-daycare.service';

describe('ManageDaycareService', () => {
  let service: ManageDaycareService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ManageDaycareService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
