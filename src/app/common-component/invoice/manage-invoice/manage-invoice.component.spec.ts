import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageInvoiceComponent } from './manage-invoice.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideRouter } from '@angular/router';

describe('ManageInvoiceComponent', () => {
  let component: ManageInvoiceComponent;
  let fixture: ComponentFixture<ManageInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageInvoiceComponent],
      providers: [provideRouter([])],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(ManageInvoiceComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the ManageInvoiceComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render template', () => {
    expect(fixture.nativeElement).toBeDefined();
  });
});
