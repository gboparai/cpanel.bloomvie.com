import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TocTeacherViewComponent } from './toc-teacher-view.component';

describe('TocTeacherViewComponent', () => {
  let component: TocTeacherViewComponent;
  let fixture: ComponentFixture<TocTeacherViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TocTeacherViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TocTeacherViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
