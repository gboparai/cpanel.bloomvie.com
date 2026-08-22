import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildRoutineComponent } from './child-routine.component';

describe('ChildRoutineComponent', () => {
  let component: ChildRoutineComponent;
  let fixture: ComponentFixture<ChildRoutineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChildRoutineComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChildRoutineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
