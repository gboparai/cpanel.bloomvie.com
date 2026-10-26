import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ViewBusinessComponent } from './view-business.component';

describe('ViewBusinessComponent', () => {
  let component: ViewBusinessComponent;
  let fixture: ComponentFixture<ViewBusinessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewBusinessComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewBusinessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render template content', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('p')?.textContent).toContain('view-business works!');
  });
});
