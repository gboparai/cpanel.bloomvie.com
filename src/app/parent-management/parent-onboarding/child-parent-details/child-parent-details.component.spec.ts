import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildParentDetailsComponent } from './child-parent-details.component';

describe('ChildParentDetailsComponent', () => {
  let component: ChildParentDetailsComponent;
  let fixture: ComponentFixture<ChildParentDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChildParentDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChildParentDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
