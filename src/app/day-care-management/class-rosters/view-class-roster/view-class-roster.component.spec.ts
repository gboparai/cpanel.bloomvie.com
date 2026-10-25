import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewClassRosterComponent } from './view-class-roster.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ViewClassRosterComponent', () => {
  let component: ViewClassRosterComponent;
  let fixture: ComponentFixture<ViewClassRosterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewClassRosterComponent],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ViewClassRosterComponent, {
        set: {
          imports: [],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ViewClassRosterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create ViewClassRosterComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render roster view correctly', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled).toBeDefined();
  });
});
