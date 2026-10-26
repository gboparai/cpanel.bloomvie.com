import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ManageStudentGalleryService } from './manage-student-gallery.service';

describe('ManageStudentGalleryService', () => {
  let service: ManageStudentGalleryService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ManageStudentGalleryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
