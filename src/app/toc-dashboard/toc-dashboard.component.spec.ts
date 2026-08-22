import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TocDashboardComponent } from './toc-dashboard.component';

describe('TocDashboardComponent', () => {
  let component: TocDashboardComponent;
  let fixture: ComponentFixture<TocDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TocDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TocDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
