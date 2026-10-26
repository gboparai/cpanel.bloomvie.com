import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BillingReportComponent } from './billing-report.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('BillingReportComponent', () => {
  let component: BillingReportComponent;
  let fixture: ComponentFixture<BillingReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillingReportComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(BillingReportComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillingReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the BillingReportComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render template', () => {
    expect(fixture.nativeElement).toBeDefined();
  });
});
