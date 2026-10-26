import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BloomvieJobPortalComponent } from './bloomvie-job-portal.component';

describe('BloomvieJobPortalComponent', () => {
  let component: BloomvieJobPortalComponent;
  let fixture: ComponentFixture<BloomvieJobPortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BloomvieJobPortalComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(BloomvieJobPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render header and form controls properly', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.heading-new h5')?.textContent).toContain('Add Jobs');
    expect(compiled.querySelector('button[type="submit"]')?.textContent).toContain('Submit');
    expect(compiled.querySelector('button[type="reset"]')?.textContent).toContain('Cancel');
  });
});
