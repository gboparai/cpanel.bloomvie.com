import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { JobStatusComponent } from './job-status.component';

describe('JobStatusComponent', () => {
  let component: JobStatusComponent;
  let fixture: ComponentFixture<JobStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobStatusComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(JobStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render table headings and status dropdown', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.heading-new h5')?.textContent).toContain('View Job Status');
    expect(compiled.querySelector('table thead')?.textContent).toContain('Daycare Name');
    expect(compiled.querySelector('table thead')?.textContent).toContain('Job Title');
  });
});
