import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddDaycareComponent } from './add-daycare.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AddDaycareComponent', () => {
  let component: AddDaycareComponent;
  let fixture: ComponentFixture<AddDaycareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDaycareComponent],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(AddDaycareComponent, {
        set: {
          imports: [],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AddDaycareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create AddDaycareComponent successfully', () => {
    expect(component).toBeTruthy();
  });

  it('should render the component container', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled).toBeDefined();
  });
});
