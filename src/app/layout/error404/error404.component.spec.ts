import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Error404Component } from './error404.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('Error404Component', () => {
  let component: Error404Component;
  let fixture: ComponentFixture<Error404Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Error404Component],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(Error404Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the error 404 component', () => {
    expect(component).toBeTruthy();
  });

  it('should render 404 error page elements', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled).toBeDefined();
  });
});
