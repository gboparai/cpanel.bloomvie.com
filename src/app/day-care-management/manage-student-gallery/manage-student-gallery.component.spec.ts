import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageStudentGalleryComponent } from './manage-student-gallery.component';

describe('ManageStudentGalleryComponent', () => {
  let component: ManageStudentGalleryComponent;
  let fixture: ComponentFixture<ManageStudentGalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageStudentGalleryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManageStudentGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
