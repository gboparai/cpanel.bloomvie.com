import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollExpenseComponent } from './payroll-expense.component';

describe('PayrollExpenseComponent', () => {
  let component: PayrollExpenseComponent;
  let fixture: ComponentFixture<PayrollExpenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayrollExpenseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PayrollExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
