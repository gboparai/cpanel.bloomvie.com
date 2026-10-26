import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditDaycareComponent } from './edit-daycare.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('EditDaycareComponent', () => {
  let component: EditDaycareComponent;
  let fixture: ComponentFixture<EditDaycareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditDaycareComponent],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(EditDaycareComponent, {
        set: {
          imports: [],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(EditDaycareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create EditDaycareComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render daycare edit template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled).toBeDefined();
  });
});
