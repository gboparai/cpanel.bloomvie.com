import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewBusinessComponent } from './view-business.component';

describe('ViewBusinessComponent', () => {
  let component: ViewBusinessComponent;
  let fixture: ComponentFixture<ViewBusinessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewBusinessComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewBusinessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
