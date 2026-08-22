import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BloomvieInvoiceComponent } from './bloomvie-invoice.component';

describe('BloomvieInvoiceComponent', () => {
  let component: BloomvieInvoiceComponent;
  let fixture: ComponentFixture<BloomvieInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BloomvieInvoiceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BloomvieInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
