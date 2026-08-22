import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDaycareComponent } from './view-daycare.component';

describe('ViewDaycareComponent', () => {
  let component: ViewDaycareComponent;
  let fixture: ComponentFixture<ViewDaycareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDaycareComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewDaycareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
