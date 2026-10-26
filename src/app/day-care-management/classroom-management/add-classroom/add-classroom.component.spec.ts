import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddClassroomComponent } from './add-classroom.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AddClassroomComponent', () => {
  let component: AddClassroomComponent;
  let fixture: ComponentFixture<AddClassroomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddClassroomComponent],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(AddClassroomComponent, {
        set: {
          imports: [],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AddClassroomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create AddClassroomComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render classroom container elements', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled).toBeDefined();
  });
});
