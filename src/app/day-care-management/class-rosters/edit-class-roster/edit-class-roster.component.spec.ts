import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditClassRosterComponent } from './edit-class-roster.component';

describe('EditClassRosterComponent', () => {
  let component: EditClassRosterComponent;
  let fixture: ComponentFixture<EditClassRosterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditClassRosterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditClassRosterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
