import { TestBed } from '@angular/core/testing';

import { ViewTeacherService } from './view-teacher.service';

describe('ViewTeacherService', () => {
  let service: ViewTeacherService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ViewTeacherService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
