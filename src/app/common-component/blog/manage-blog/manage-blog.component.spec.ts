import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageBlogComponent } from './manage-blog.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideRouter } from '@angular/router';

describe('ManageBlogComponent', () => {
  let component: ManageBlogComponent;
  let fixture: ComponentFixture<ManageBlogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageBlogComponent],
      providers: [provideRouter([])],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(ManageBlogComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageBlogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the ManageBlogComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render the component template', () => {
    expect(fixture.nativeElement).toBeDefined();
  });
});
