import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DaycareAppointmentsComponent } from './daycare-appointments.component';

describe('DaycareAppointmentsComponent', () => {
  let component: DaycareAppointmentsComponent;
  let fixture: ComponentFixture<DaycareAppointmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DaycareAppointmentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DaycareAppointmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
