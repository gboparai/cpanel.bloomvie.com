import { TestBed } from '@angular/core/testing';

import { TeacherDashboardServiceService } from './teacher-dashboard-service.service';

describe('TeacherDashboardServiceService', () => {
  let service: TeacherDashboardServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TeacherDashboardServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
