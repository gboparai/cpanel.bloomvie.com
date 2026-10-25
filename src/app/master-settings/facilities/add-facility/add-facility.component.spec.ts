import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddFacilityComponent } from './add-facility.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AddFacilityComponent', () => {
  let component: AddFacilityComponent;
  let fixture: ComponentFixture<AddFacilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddFacilityComponent],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(AddFacilityComponent, {
        set: {
          imports: [],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AddFacilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component instance', () => {
    expect(component).toBeTruthy();
  });

  it('should render the view facility header and table', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h5')?.textContent).toContain('View Facility');
    expect(compiled.querySelector('table')).toBeTruthy();
  });

  it('should render the add facility modal dialog', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const modal = compiled.querySelector('#exampleModal');
    expect(modal).toBeTruthy();
  });
});
