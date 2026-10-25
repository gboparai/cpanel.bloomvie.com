import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewBlogComponent } from './view-blog.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideRouter } from '@angular/router';

describe('ViewBlogComponent', () => {
  let component: ViewBlogComponent;
  let fixture: ComponentFixture<ViewBlogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewBlogComponent],
      providers: [provideRouter([])],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(ViewBlogComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewBlogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the ViewBlogComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render the component template', () => {
    expect(fixture.nativeElement).toBeDefined();
  });
});
