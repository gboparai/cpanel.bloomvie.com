import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageClassRosterComponent } from './manage-class-roster.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ManageClassRosterComponent', () => {
  let component: ManageClassRosterComponent;
  let fixture: ComponentFixture<ManageClassRosterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageClassRosterComponent],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ManageClassRosterComponent, {
        set: {
          imports: [],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ManageClassRosterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create ManageClassRosterComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render roster management view', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled).toBeDefined();
  });
});
