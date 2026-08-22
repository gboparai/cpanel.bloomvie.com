import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplyRequestComponent } from './supply-request.component';

describe('SupplyRequestComponent', () => {
  let component: SupplyRequestComponent;
  let fixture: ComponentFixture<SupplyRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplyRequestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SupplyRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
