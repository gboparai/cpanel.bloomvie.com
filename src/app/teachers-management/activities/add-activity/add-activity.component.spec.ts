import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AddActivityComponent } from './add-activity.component';

describe('AddActivityComponent', () => {
  let component: AddActivityComponent;
  let fixture: ComponentFixture<AddActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddActivityComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(AddActivityComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render breadcrumb, manage-activity, and view-activity placeholders', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-breadcrumb')).not.toBeNull();
    expect(compiled.querySelector('app-manage-activity')).not.toBeNull();
    expect(compiled.querySelector('app-view-activity')).not.toBeNull();
  });

  it('should include breadcrum-none container for view-activity', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const breadcrumbNone = compiled.querySelector('.breadcrum-none');
    expect(breadcrumbNone).not.toBeNull();
    expect(breadcrumbNone?.querySelector('app-view-activity')).not.toBeNull();
  });
});
