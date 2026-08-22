import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BloomviePlansComponent } from './bloomvie-plans.component';

describe('BloomviePlansComponent', () => {
  let component: BloomviePlansComponent;
  let fixture: ComponentFixture<BloomviePlansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BloomviePlansComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BloomviePlansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
