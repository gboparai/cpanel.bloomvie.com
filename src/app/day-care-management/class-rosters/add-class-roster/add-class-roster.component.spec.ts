import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddClassRosterComponent } from './add-class-roster.component';

describe('AddClassRosterComponent', () => {
  let component: AddClassRosterComponent;
  let fixture: ComponentFixture<AddClassRosterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddClassRosterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddClassRosterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
