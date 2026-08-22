import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CapitalExpenseComponent } from './capital-expense.component';

describe('CapitalExpenseComponent', () => {
  let component: CapitalExpenseComponent;
  let fixture: ComponentFixture<CapitalExpenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CapitalExpenseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CapitalExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
