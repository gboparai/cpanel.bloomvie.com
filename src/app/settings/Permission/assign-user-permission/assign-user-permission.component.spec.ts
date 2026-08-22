import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignUserPermissionComponent } from './assign-user-permission.component';

describe('AssignUserPermissionComponent', () => {
  let component: AssignUserPermissionComponent;
  let fixture: ComponentFixture<AssignUserPermissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignUserPermissionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssignUserPermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
