import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DaycareInvoiceComponent } from './daycare-invoice.component';

describe('DaycareInvoiceComponent', () => {
  let component: DaycareInvoiceComponent;
  let fixture: ComponentFixture<DaycareInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DaycareInvoiceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DaycareInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
