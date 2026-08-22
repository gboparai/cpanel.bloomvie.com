import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeachersJourneyComponent } from './teachers-journey.component';

describe('TeachersJourneyComponent', () => {
  let component: TeachersJourneyComponent;
  let fixture: ComponentFixture<TeachersJourneyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeachersJourneyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeachersJourneyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
