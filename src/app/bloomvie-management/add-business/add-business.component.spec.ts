import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AddBusinessComponent } from './add-business.component';

describe('AddBusinessComponent', () => {
  let component: AddBusinessComponent;
  let fixture: ComponentFixture<AddBusinessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBusinessComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AddBusinessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render initial template content', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('p')?.textContent).toContain('add-business works!');
  });
});
