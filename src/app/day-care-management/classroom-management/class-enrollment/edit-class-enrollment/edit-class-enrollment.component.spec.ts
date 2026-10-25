import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditClassEnrollmentComponent } from './edit-class-enrollment.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('EditClassEnrollmentComponent', () => {
  let component: EditClassEnrollmentComponent;
  let fixture: ComponentFixture<EditClassEnrollmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditClassEnrollmentComponent],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(EditClassEnrollmentComponent, {
        set: {
          imports: [],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(EditClassEnrollmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create EditClassEnrollmentComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render edit enrollment view', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled).toBeDefined();
  });
});
