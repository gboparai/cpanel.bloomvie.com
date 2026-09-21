import { TestBed } from '@angular/core/testing';

import { ManageStudentService } from './manage-student.service';

describe('ManageStudentService', () => {
  let service: ManageStudentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageStudentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
