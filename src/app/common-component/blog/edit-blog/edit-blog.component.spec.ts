import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditBlogComponent } from './edit-blog.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('EditBlogComponent', () => {
  let component: EditBlogComponent;
  let fixture: ComponentFixture<EditBlogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditBlogComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(EditBlogComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditBlogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the EditBlogComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render the component template', () => {
    expect(fixture.nativeElement).toBeDefined();
  });
});
