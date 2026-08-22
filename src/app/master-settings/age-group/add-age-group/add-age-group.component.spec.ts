import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAgeGroupComponent } from './add-age-group.component';

describe('AddAgeGroupComponent', () => {
  let component: AddAgeGroupComponent;
  let fixture: ComponentFixture<AddAgeGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddAgeGroupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddAgeGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
