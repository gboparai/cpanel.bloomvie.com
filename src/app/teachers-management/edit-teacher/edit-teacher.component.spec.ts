import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { EditTeacherComponent } from './edit-teacher.component';

describe('EditTeacherComponent', () => {
  let component: EditTeacherComponent;
  let fixture: ComponentFixture<EditTeacherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditTeacherComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(EditTeacherComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditTeacherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the edit teacher template content', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('p')?.textContent).toContain('edit-teacher works!');
  });
});
