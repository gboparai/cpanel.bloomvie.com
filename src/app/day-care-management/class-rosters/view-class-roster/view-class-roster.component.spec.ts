import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewClassRosterComponent } from './view-class-roster.component';

describe('ViewClassRosterComponent', () => {
  let component: ViewClassRosterComponent;
  let fixture: ComponentFixture<ViewClassRosterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewClassRosterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewClassRosterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
