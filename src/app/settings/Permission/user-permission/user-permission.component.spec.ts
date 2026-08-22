import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPermissionComponent } from './user-permission.component';

describe('UserPermissionComponent', () => {
  let component: UserPermissionComponent;
  let fixture: ComponentFixture<UserPermissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserPermissionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserPermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
