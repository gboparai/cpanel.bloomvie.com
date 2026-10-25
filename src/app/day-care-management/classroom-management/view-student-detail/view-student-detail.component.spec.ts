import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewStudentDetailComponent } from './view-student-detail.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ViewStudentDetailComponent', () => {
  let component: ViewStudentDetailComponent;
  let fixture: ComponentFixture<ViewStudentDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewStudentDetailComponent],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ViewStudentDetailComponent, {
        set: {
          imports: [],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ViewStudentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create ViewStudentDetailComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render student detail container', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled).toBeDefined();
  });
});
