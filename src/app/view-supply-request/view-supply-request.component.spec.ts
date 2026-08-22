import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSupplyRequestComponent } from './view-supply-request.component';

describe('ViewSupplyRequestComponent', () => {
  let component: ViewSupplyRequestComponent;
  let fixture: ComponentFixture<ViewSupplyRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewSupplyRequestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewSupplyRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
