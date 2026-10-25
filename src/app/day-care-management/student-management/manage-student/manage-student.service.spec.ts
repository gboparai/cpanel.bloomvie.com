import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ManageStudentService } from './manage-student.service';

describe('ManageStudentService', () => {
  let service: ManageStudentService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ManageStudentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
