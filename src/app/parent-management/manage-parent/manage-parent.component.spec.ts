import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ManageParentComponent } from './manage-parent.component';

describe('ManageParentComponent', () => {
  let component: ManageParentComponent;
  let fixture: ComponentFixture<ManageParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageParentComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(ManageParentComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the manage parent template content', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('p')?.textContent).toContain('manage-parent works!');
  });
});
