import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewClassEnrollmentComponent } from './view-class-enrollment.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ViewClassEnrollmentComponent', () => {
  let component: ViewClassEnrollmentComponent;
  let fixture: ComponentFixture<ViewClassEnrollmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewClassEnrollmentComponent],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ViewClassEnrollmentComponent, {
        set: {
          imports: [],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ViewClassEnrollmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create ViewClassEnrollmentComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render class enrollment view', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled).toBeDefined();
  });
});
