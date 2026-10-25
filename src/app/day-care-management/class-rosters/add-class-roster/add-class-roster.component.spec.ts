import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddClassRosterComponent } from './add-class-roster.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AddClassRosterComponent', () => {
  let component: AddClassRosterComponent;
  let fixture: ComponentFixture<AddClassRosterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddClassRosterComponent],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(AddClassRosterComponent, {
        set: {
          imports: [],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AddClassRosterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create AddClassRosterComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render child container elements', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled).toBeDefined();
  });
});
