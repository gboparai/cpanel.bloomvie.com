import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleSpecializationComponent } from './role-specialization.component';

describe('RoleSpecializationComponent', () => {
  let component: RoleSpecializationComponent;
  let fixture: ComponentFixture<RoleSpecializationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleSpecializationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RoleSpecializationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
