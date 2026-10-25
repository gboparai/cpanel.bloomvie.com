import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddBlogComponent } from './add-blog.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AddBlogComponent', () => {
  let component: AddBlogComponent;
  let fixture: ComponentFixture<AddBlogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBlogComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(AddBlogComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBlogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the AddBlogComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render the component template', () => {
    expect(fixture.nativeElement).toBeDefined();
  });
});
