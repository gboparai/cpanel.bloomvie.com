import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddStudentComponent } from './add-student.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AddStudentComponent', () => {
  let component: AddStudentComponent;
  let fixture: ComponentFixture<AddStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddStudentComponent],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(AddStudentComponent, {
        set: {
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AddStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the AddStudentComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render host template container', () => {
    expect(fixture.nativeElement).toBeTruthy();
  });
});
