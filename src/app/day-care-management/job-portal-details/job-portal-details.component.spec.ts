import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobPortalDetailsComponent } from './job-portal-details.component';

describe('JobPortalDetailsComponent', () => {
  let component: JobPortalDetailsComponent;
  let fixture: ComponentFixture<JobPortalDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobPortalDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(JobPortalDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
