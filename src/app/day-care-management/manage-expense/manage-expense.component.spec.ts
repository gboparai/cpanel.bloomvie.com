import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageExpenseComponent } from './manage-expense.component';

describe('ManageExpenseComponent', () => {
  let component: ManageExpenseComponent;
  let fixture: ComponentFixture<ManageExpenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageExpenseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManageExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
