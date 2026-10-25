import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TooltipComponent } from './tooltip.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('TooltipComponent', () => {
  let component: TooltipComponent;
  let fixture: ComponentFixture<TooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TooltipComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(TooltipComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(TooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the TooltipComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should have default employee properties', () => {
    expect(component.employee).toBeDefined();
    expect(component.employee.fullName).toBe('');
    expect(component.employee.email).toBe('');
    expect(component.employee.profile).toBe('');
  });

  it('should accept custom employee input', () => {
    component.employee = {
      fullName: 'Sarah Connor',
      email: 'sarah@resistance.org',
      profile: 'profile.jpg'
    };
    fixture.detectChanges();

    expect(component.employee.fullName).toBe('Sarah Connor');
    expect(component.employee.email).toBe('sarah@resistance.org');
    expect(component.employee.profile).toBe('profile.jpg');
  });
});
