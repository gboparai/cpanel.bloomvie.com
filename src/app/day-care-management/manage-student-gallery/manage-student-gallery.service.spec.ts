import { TestBed } from '@angular/core/testing';

import { ManageStudentGalleryService } from './manage-student-gallery.service';

describe('ManageStudentGalleryService', () => {
  let service: ManageStudentGalleryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageStudentGalleryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
