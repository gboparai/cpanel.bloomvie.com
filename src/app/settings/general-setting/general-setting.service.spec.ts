import { TestBed } from '@angular/core/testing';

import { GeneralSettingService } from './general-setting.service';

describe('GeneralSettingService', () => {
  let service: GeneralSettingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeneralSettingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
