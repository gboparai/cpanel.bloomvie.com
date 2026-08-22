import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationsSettingsComponent } from './applications-settings.component';

describe('ApplicationsSettingsComponent', () => {
  let component: ApplicationsSettingsComponent;
  let fixture: ComponentFixture<ApplicationsSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationsSettingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ApplicationsSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
