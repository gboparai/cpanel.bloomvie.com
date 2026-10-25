import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ManageBusinessComponent } from './manage-business.component';

describe('ManageBusinessComponent', () => {
  let component: ManageBusinessComponent;
  let fixture: ComponentFixture<ManageBusinessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageBusinessComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageBusinessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render navigation pill tabs in template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('#pills-basic-info')?.textContent).toContain('Basic Information');
    expect(compiled.querySelectorAll('.nav-link').length).toBeGreaterThanOrEqual(3);
  });
});
