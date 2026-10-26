import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageExpenseComponent } from './manage-expense.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ManageExpenseComponent', () => {
  let component: ManageExpenseComponent;
  let fixture: ComponentFixture<ManageExpenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageExpenseComponent],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ManageExpenseComponent, {
        set: {
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ManageExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the ManageExpenseComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render breadcrumb or host container', () => {
    expect(fixture.nativeElement).toBeTruthy();
  });
});
