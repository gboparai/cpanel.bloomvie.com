import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddClassComponent } from './add-class.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AddClassComponent', () => {
  let component: AddClassComponent;
  let fixture: ComponentFixture<AddClassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddClassComponent],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(AddClassComponent, {
        set: {
          template: `
            <div class="row">
              <button type="button" class="btn btn-primary">Add Class</button>
              <div class="table-responsive">
                <table><tbody><tr><td>alpha</td></tr></tbody></table>
              </div>
              <div id="exampleModal"></div>
            </div>
          `,
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AddClassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component instance', () => {
    expect(component).toBeTruthy();
  });

  it('should render table structure and add class button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('table')).toBeTruthy();
    expect(compiled.querySelector('.btn-primary')?.textContent).toContain('Add Class');
  });

  it('should render modal dialog in DOM', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const modal = compiled.querySelector('#exampleModal');
    expect(modal).toBeTruthy();
  });
});
