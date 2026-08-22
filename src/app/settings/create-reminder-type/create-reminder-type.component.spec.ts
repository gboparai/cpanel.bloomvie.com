import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateReminderTypeComponent } from './create-reminder-type.component';

describe('CreateReminderTypeComponent', () => {
  let component: CreateReminderTypeComponent;
  let fixture: ComponentFixture<CreateReminderTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateReminderTypeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateReminderTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
