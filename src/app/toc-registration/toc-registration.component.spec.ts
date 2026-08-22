import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TOCRegistrationComponent } from './toc-registration.component';

describe('TOCRegistrationComponent', () => {
  let component: TOCRegistrationComponent;
  let fixture: ComponentFixture<TOCRegistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TOCRegistrationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TOCRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
