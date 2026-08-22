import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TocScheduleComponent } from './toc-schedule.component';

describe('TocScheduleComponent', () => {
  let component: TocScheduleComponent;
  let fixture: ComponentFixture<TocScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TocScheduleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TocScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
