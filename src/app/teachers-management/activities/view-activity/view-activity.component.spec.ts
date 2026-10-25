import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ViewActivityComponent } from './view-activity.component';

describe('ViewActivityComponent', () => {
  let component: ViewActivityComponent;
  let fixture: ComponentFixture<ViewActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewActivityComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(ViewActivityComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the View Activity heading and table', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const heading = compiled.querySelector('.heading-new h5');
    expect(heading?.textContent?.trim()).toBe('View Activity');

    const table = compiled.querySelector('table');
    expect(table).not.toBeNull();
  });

  it('should render table columns for activity details', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const headers = compiled.querySelectorAll('thead th');
    expect(headers.length).toBe(6);
    expect(headers[1].textContent).toContain('Activity');
    expect(headers[5].textContent).toContain('Action');
  });

  it('should render rows for sample activities', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const rows = compiled.querySelectorAll('tbody tr');
    expect(rows.length).toBeGreaterThanOrEqual(3);
    expect(rows[0].textContent).toContain('Birthday');
    expect(rows[1].textContent).toContain('Easter');
    expect(rows[2].textContent).toContain('Flag day');
  });
});
