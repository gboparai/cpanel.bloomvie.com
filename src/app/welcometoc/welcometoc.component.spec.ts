import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WelcometocComponent } from './welcometoc.component';

describe('WelcometocComponent', () => {
  let component: WelcometocComponent;
  let fixture: ComponentFixture<WelcometocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WelcometocComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WelcometocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
