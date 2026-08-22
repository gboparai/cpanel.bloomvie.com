import { TestBed } from '@angular/core/testing';

import { TeacherAreaOfExpertiseService } from './teacher-area-of-expertise.service';

describe('TeacherAreaOfExpertiseService', () => {
  let service: TeacherAreaOfExpertiseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TeacherAreaOfExpertiseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
