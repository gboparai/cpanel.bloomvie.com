import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { EditActivityComponent } from './edit-activity.component';

describe('EditActivityComponent', () => {
  let component: EditActivityComponent;
  let fixture: ComponentFixture<EditActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditActivityComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(EditActivityComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the edit activity template content', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('p')?.textContent).toContain('edit-activity works!');
  });
});
