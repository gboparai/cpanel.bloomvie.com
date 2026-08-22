import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwitcherComponentComponent } from './switcher-component.component';

describe('SwitcherComponentComponent', () => {
  let component: SwitcherComponentComponent;
  let fixture: ComponentFixture<SwitcherComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SwitcherComponentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SwitcherComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
