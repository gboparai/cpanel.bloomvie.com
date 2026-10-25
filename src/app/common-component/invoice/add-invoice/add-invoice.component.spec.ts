import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddInvoiceComponent } from './add-invoice.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AddInvoiceComponent', () => {
  let component: AddInvoiceComponent;
  let fixture: ComponentFixture<AddInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddInvoiceComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(AddInvoiceComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the AddInvoiceComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render template', () => {
    expect(fixture.nativeElement).toBeDefined();
  });
});
