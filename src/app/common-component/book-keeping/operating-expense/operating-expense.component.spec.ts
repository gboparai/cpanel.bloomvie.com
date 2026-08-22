import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatingExpenseComponent } from './operating-expense.component';

describe('OperatingExpenseComponent', () => {
  let component: OperatingExpenseComponent;
  let fixture: ComponentFixture<OperatingExpenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperatingExpenseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OperatingExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
