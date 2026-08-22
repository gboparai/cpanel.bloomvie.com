import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PickupPersonComponent } from './pickup-person.component';

describe('PickupPersonComponent', () => {
  let component: PickupPersonComponent;
  let fixture: ComponentFixture<PickupPersonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PickupPersonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PickupPersonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
