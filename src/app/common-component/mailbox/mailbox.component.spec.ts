import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MailboxComponent } from './mailbox.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideRouter } from '@angular/router';

describe('MailboxComponent', () => {
  let component: MailboxComponent;
  let fixture: ComponentFixture<MailboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MailboxComponent],
      providers: [provideRouter([])],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(MailboxComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(MailboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the MailboxComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render template', () => {
    expect(fixture.nativeElement).toBeDefined();
  });
});
