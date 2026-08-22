import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DayCareSettingsComponent } from './day-care-settings.component';

describe('DayCareSettingsComponent', () => {
  let component: DayCareSettingsComponent;
  let fixture: ComponentFixture<DayCareSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DayCareSettingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DayCareSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
