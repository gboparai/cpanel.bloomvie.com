import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageBroadcastsComponent } from './manage-broadcasts.component';

describe('ManageBroadcastsComponent', () => {
  let component: ManageBroadcastsComponent;
  let fixture: ComponentFixture<ManageBroadcastsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageBroadcastsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManageBroadcastsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
