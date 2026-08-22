import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalActivityComponent } from './personal-activity.component';

describe('PersonalActivityComponent', () => {
  let component: PersonalActivityComponent;
  let fixture: ComponentFixture<PersonalActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalActivityComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PersonalActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
