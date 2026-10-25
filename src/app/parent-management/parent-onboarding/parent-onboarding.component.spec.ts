import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { ParentOnboardingComponent } from './parent-onboarding.component';
import { CookieService } from 'ngx-cookie-service';
import { CommonService } from '../../common-component/common.service';

describe('ParentOnboardingComponent', () => {
  let component: ParentOnboardingComponent;
  let fixture: ComponentFixture<ParentOnboardingComponent>;

  let mockCookie: jasmine.SpyObj<CookieService>;
  let mockCommonService: any;
  const secretKey = 'encrypt!135790';
  const encryptedId = CryptoJS.AES.encrypt('100', secretKey).toString();

  beforeEach(async () => {
    mockCookie = jasmine.createSpyObj('CookieService', ['get', 'set']);
    mockCommonService = {
      loadStep1: signal(false),
      loadStep2: signal(false),
      updateDisplaySpinner: jasmine.createSpy('updateDisplaySpinner')
    };

    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      addClass: jasmine.createSpy('addClass'),
      removeClass: jasmine.createSpy('removeClass')
    });

    await TestBed.configureTestingModule({
      imports: [ParentOnboardingComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: CookieService, useValue: mockCookie },
        { provide: CommonService, useValue: mockCommonService },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ id: encryptedId, Update: 'true' })
          }
        }
      ]
    })
    .overrideComponent(ParentOnboardingComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParentOnboardingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component and process query params', () => {
    expect(component).toBeTruthy();
    expect(mockCookie.set).toHaveBeenCalledWith('Update', 'true');
  });

  it('should set Update cookie to false when Update query param is not present', () => {
    const route = TestBed.inject(ActivatedRoute);
    (route as any).queryParams = of({ id: encryptedId });

    component.ngOnInit();
    expect(mockCookie.set).toHaveBeenCalledWith('Update', 'false');
  });

  it('should update isFirstFormSubmitted on onFirstFormSubmit', () => {
    expect(component.isFirstFormSubmitted).toBeFalse();
    component.onFirstFormSubmit();
    expect(component.isFirstFormSubmitted).toBeTrue();
  });

  describe('preventTabClick', () => {
    it('should prevent tab click when first form is not submitted', () => {
      component.isFirstFormSubmitted = false;
      const event = new MouseEvent('click');
      spyOn(event, 'preventDefault');

      component.preventTabClick(event);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should allow tab click when first form is submitted', () => {
      component.isFirstFormSubmitted = true;
      const event = new MouseEvent('click');
      spyOn(event, 'preventDefault');

      component.preventTabClick(event);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  it('should switch active tabs using jQuery in ToActiveAnotherTab', () => {
    component.ToActiveAnotherTab();
    expect((window as any).$).toHaveBeenCalledWith('.nav-pills .nav-link[href="#child-routine"]');
    expect((window as any).$).toHaveBeenCalledWith('.nav-pills .nav-link[href="#child-parent-basic-deatils"]');
  });
});
