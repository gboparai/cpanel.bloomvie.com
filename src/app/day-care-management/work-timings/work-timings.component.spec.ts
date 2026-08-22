import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkTimingsComponent } from './work-timings.component';

describe('WorkTimingsComponent', () => {
  let component: WorkTimingsComponent;
  let fixture: ComponentFixture<WorkTimingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkTimingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WorkTimingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
