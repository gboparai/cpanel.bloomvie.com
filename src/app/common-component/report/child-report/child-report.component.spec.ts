import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildReportComponent } from './child-report.component';

describe('ChildReportComponent', () => {
  let component: ChildReportComponent;
  let fixture: ComponentFixture<ChildReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChildReportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChildReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
