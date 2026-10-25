import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { EditParentComponent } from './edit-parent.component';

describe('EditParentComponent', () => {
  let component: EditParentComponent;
  let fixture: ComponentFixture<EditParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditParentComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(EditParentComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the edit parent template content', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('p')?.textContent).toContain('edit-parent works!');
  });
});
