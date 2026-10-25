import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditStudentComponent } from './edit-student.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('EditStudentComponent', () => {
  let component: EditStudentComponent;
  let fixture: ComponentFixture<EditStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditStudentComponent],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(EditStudentComponent, {
        set: {
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(EditStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the EditStudentComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render component template', () => {
    expect(fixture.nativeElement).toBeTruthy();
  });
});
