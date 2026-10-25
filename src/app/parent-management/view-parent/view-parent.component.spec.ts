import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ViewParentComponent } from './view-parent.component';

describe('ViewParentComponent', () => {
  let component: ViewParentComponent;
  let fixture: ComponentFixture<ViewParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewParentComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(ViewParentComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the view parent template content', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('p')?.textContent).toContain('view-parent works!');
  });
});
