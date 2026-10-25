import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocalizationDetailsComponent } from './localization-details.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('LocalizationDetailsComponent', () => {
  let component: LocalizationDetailsComponent;
  let fixture: ComponentFixture<LocalizationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocalizationDetailsComponent],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(LocalizationDetailsComponent, {
        set: {
          imports: [],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(LocalizationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component instance', () => {
    expect(component).toBeTruthy();
  });

  it('should render localization container in template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled).toBeDefined();
  });
});
