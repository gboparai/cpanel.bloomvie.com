import { TestBed } from '@angular/core/testing';
import { WelcometocService } from './welcometoc.service';

describe('WelcometocService', () => {
  let service: WelcometocService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WelcometocService]
    });
    service = TestBed.inject(WelcometocService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
