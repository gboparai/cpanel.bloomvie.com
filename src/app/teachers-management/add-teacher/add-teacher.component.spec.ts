import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AddTeacherComponent } from './add-teacher.component';

describe('AddTeacherComponent', () => {
  let component: AddTeacherComponent;
  let fixture: ComponentFixture<AddTeacherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTeacherComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(AddTeacherComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTeacherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render breadcrumb and manage-teacher components', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-breadcrumb')).not.toBeNull();
    expect(compiled.querySelector('app-manage-teacher')).not.toBeNull();
  });
});
