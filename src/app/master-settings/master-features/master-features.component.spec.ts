import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MasterFeaturesComponent } from './master-features.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('MasterFeaturesComponent', () => {
  let component: MasterFeaturesComponent;
  let fixture: ComponentFixture<MasterFeaturesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterFeaturesComponent],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(MasterFeaturesComponent, {
        set: {
          imports: [],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(MasterFeaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component instance', () => {
    expect(component).toBeTruthy();
  });

  it('should render form controls and submit buttons', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('form')).toBeTruthy();
    expect(compiled.querySelector('button[type="submit"]')?.textContent).toContain('Submit');
  });

  it('should render features table structure', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('table')).toBeTruthy();
    expect(compiled.querySelector('thead')).toBeTruthy();
  });
});
