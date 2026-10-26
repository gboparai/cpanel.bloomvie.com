import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BloomvieInvoiceComponent } from './bloomvie-invoice.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('BloomvieInvoiceComponent', () => {
  let component: BloomvieInvoiceComponent;
  let fixture: ComponentFixture<BloomvieInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BloomvieInvoiceComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { params: of({}) },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(BloomvieInvoiceComponent, {
        set: {
          imports: [],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(BloomvieInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create BloomvieInvoiceComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render invoice template view', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled).toBeDefined();
  });
});
