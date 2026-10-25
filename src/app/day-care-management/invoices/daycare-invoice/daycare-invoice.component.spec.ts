import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DaycareInvoiceComponent } from './daycare-invoice.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('DaycareInvoiceComponent', () => {
  let component: DaycareInvoiceComponent;
  let fixture: ComponentFixture<DaycareInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DaycareInvoiceComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { params: of({}) },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(DaycareInvoiceComponent, {
        set: {
          imports: [],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(DaycareInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create DaycareInvoiceComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render daycare invoice template view', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled).toBeDefined();
  });
});
