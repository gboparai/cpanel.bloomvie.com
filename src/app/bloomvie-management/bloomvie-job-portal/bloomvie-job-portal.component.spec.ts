import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BloomvieJobPortalComponent } from './bloomvie-job-portal.component';

describe('BloomvieJobPortalComponent', () => {
  let component: BloomvieJobPortalComponent;
  let fixture: ComponentFixture<BloomvieJobPortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BloomvieJobPortalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BloomvieJobPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
