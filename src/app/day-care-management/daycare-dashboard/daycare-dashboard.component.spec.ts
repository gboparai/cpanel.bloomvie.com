import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DaycareDashboardComponent } from './daycare-dashboard.component';

describe('DaycareDashboardComponent', () => {
  let component: DaycareDashboardComponent;
  let fixture: ComponentFixture<DaycareDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DaycareDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DaycareDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
