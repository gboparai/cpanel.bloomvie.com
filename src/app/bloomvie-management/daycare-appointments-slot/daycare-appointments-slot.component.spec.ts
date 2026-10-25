import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { of } from 'rxjs';
import { DaycareAppointmentsSlotComponent } from './daycare-appointments-slot.component';
import { DaycareAppointmentsService } from '../daycare-appointments/daycare-appointments.service';
import { CommonService } from '../../common-component/common.service';

describe('DaycareAppointmentsSlotComponent', () => {
  let component: DaycareAppointmentsSlotComponent;
  let fixture: ComponentFixture<DaycareAppointmentsSlotComponent>;
  let daycareAppointmentsServiceSpy: jasmine.SpyObj<DaycareAppointmentsService>;
  let commonServiceSpy: jasmine.SpyObj<CommonService>;

  beforeEach(async () => {
    daycareAppointmentsServiceSpy = jasmine.createSpyObj('DaycareAppointmentsService', ['getSlotTime']);
    commonServiceSpy = jasmine.createSpyObj('CommonService', ['getUtcTime']);

    (commonServiceSpy as any).regionResponseSignal = signal({
      offsetHours: '0',
      offsetMinutes: '0',
      offsetString: '+00:00',
    });

    daycareAppointmentsServiceSpy.getSlotTime.and.returnValue(
      of({
        result: [
          { slotDate: '2026-10-25', slotStartTime: '09:00', slotEndTime: '10:00' },
        ],
      })
    );

    await TestBed.configureTestingModule({
      imports: [DaycareAppointmentsSlotComponent],
      providers: [
        { provide: DaycareAppointmentsService, useValue: daycareAppointmentsServiceSpy },
        { provide: CommonService, useValue: commonServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DaycareAppointmentsSlotComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize flatpickr in ngAfterViewInit', () => {
    component.ngAfterViewInit();
    expect(component.selectedDate).toBeDefined();
  });

  it('should handle onDateChange event and call getSlotDate', () => {
    spyOn(component, 'getSlotDate');
    const mockEvent = { target: { value: '10-25-2026' } };

    component.onDateChange(mockEvent);

    expect(component.selectedDate).toBe('10-25-2026');
    expect(component.getSlotDate).toHaveBeenCalledWith('10-25-2026');
  });

  it('should fetch slot times in getSlotDate and set Date property if result is present', () => {
    component.getSlotDate('10-25-2026');

    expect(daycareAppointmentsServiceSpy.getSlotTime).toHaveBeenCalledWith('10-25-2026', 0, 0);
    expect(component.slotDate).toEqual([
      { slotDate: '2026-10-25', slotStartTime: '09:00', slotEndTime: '10:00' },
    ]);
    expect(component.Date).toBe('2026-10-25');
  });

  it('should handle null slotDate in getSlotDate safely', () => {
    daycareAppointmentsServiceSpy.getSlotTime.and.returnValue(of({ result: null }));

    component.getSlotDate('10-25-2026');

    expect(component.slotDate).toBeNull();
    expect(component.Date).toBeUndefined();
  });
});
