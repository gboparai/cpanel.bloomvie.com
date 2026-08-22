import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeThePasswordComponent } from './change-the-password.component';

describe('ChangeThePasswordComponent', () => {
  let component: ChangeThePasswordComponent;
  let fixture: ComponentFixture<ChangeThePasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeThePasswordComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChangeThePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
