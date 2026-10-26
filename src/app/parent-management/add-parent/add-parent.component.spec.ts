import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AddParentComponent } from './add-parent.component';

describe('AddParentComponent', () => {
  let component: AddParentComponent;
  let fixture: ComponentFixture<AddParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddParentComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(AddParentComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the add parent template content', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('p')?.textContent).toContain('add-parent works!');
  });
});
