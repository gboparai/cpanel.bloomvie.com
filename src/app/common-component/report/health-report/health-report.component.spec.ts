import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HealthReportComponent } from './health-report.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideRouter } from '@angular/router';

describe('HealthReportComponent', () => {
  let component: HealthReportComponent;
  let fixture: ComponentFixture<HealthReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HealthReportComponent],
      providers: [provideRouter([])],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(HealthReportComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(HealthReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the HealthReportComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render template', () => {
    expect(fixture.nativeElement).toBeDefined();
  });
});
