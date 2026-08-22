import { TestBed } from '@angular/core/testing';

import { TocTeacherViewService } from './toc-teacher-view.service';

describe('TocTeacherViewService', () => {
  let service: TocTeacherViewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TocTeacherViewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
