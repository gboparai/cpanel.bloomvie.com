import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DaycareManualAppointmentComponent } from './daycare-manual-appointment.component';

describe('DaycareManualAppointmentComponent', () => {
  let component: DaycareManualAppointmentComponent;
  let fixture: ComponentFixture<DaycareManualAppointmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DaycareManualAppointmentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DaycareManualAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
