import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditClassroomComponent } from './edit-classroom.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('EditClassroomComponent', () => {
  let component: EditClassroomComponent;
  let fixture: ComponentFixture<EditClassroomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditClassroomComponent],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(EditClassroomComponent, {
        set: {
          imports: [],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(EditClassroomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create EditClassroomComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render edit classroom template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled).toBeDefined();
  });
});
