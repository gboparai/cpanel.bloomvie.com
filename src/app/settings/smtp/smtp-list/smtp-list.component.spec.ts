import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmtpListComponent } from './smtp-list.component';

describe('SmtpListComponent', () => {
  let component: SmtpListComponent;
  let fixture: ComponentFixture<SmtpListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmtpListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SmtpListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
