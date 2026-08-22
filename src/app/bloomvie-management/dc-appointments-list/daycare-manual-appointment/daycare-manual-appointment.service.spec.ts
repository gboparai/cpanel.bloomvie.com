import { TestBed } from '@angular/core/testing';

import { DaycareManualAppointmentService } from './daycare-manual-appointment.service';

describe('DaycareManualAppointmentService', () => {
  let service: DaycareManualAppointmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DaycareManualAppointmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
