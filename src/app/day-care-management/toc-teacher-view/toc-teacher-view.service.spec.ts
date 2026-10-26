import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { TocTeacherViewService } from './toc-teacher-view.service';

describe('TocTeacherViewService', () => {
  let service: TocTeacherViewService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(TocTeacherViewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
