import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDaycareComponent } from './edit-daycare.component';

describe('EditDaycareComponent', () => {
  let component: EditDaycareComponent;
  let fixture: ComponentFixture<EditDaycareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditDaycareComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditDaycareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
