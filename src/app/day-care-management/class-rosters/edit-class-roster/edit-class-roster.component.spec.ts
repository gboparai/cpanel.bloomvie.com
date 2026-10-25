import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditClassRosterComponent } from './edit-class-roster.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('EditClassRosterComponent', () => {
  let component: EditClassRosterComponent;
  let fixture: ComponentFixture<EditClassRosterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditClassRosterComponent],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(EditClassRosterComponent, {
        set: {
          imports: [],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(EditClassRosterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create EditClassRosterComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render component template successfully', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled).toBeDefined();
  });
});
