import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDaycareComponent } from './add-daycare.component';

describe('AddDaycareComponent', () => {
  let component: AddDaycareComponent;
  let fixture: ComponentFixture<AddDaycareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDaycareComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddDaycareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
