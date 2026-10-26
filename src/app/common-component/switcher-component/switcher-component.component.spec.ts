import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SwitcherComponentComponent } from './switcher-component.component';
import { CookieService } from 'ngx-cookie-service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('SwitcherComponentComponent', () => {
  let component: SwitcherComponentComponent;
  let fixture: ComponentFixture<SwitcherComponentComponent>;
  let mockCookieService: jasmine.SpyObj<CookieService>;

  beforeEach(async () => {
    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'set']);
    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'theme-color') return '#123456';
      return '';
    });

    await TestBed.configureTestingModule({
      imports: [SwitcherComponentComponent],
      providers: [
        { provide: CookieService, useValue: mockCookieService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(SwitcherComponentComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(SwitcherComponentComponent);
    component = fixture.componentInstance;
  });

  it('should create the SwitcherComponentComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set main-color to stored cookie theme-color if present', () => {
      spyOn(document.documentElement.style, 'setProperty');

      component.ngOnInit();

      expect(mockCookieService.get).toHaveBeenCalledWith('theme-color');
      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--main-color', '#123456');
    });

    it('should fallback main-color to default #a2719e if theme-color cookie is empty', () => {
      mockCookieService.get.and.returnValue('');
      spyOn(document.documentElement.style, 'setProperty');

      component.ngOnInit();

      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--main-color', '#a2719e');
    });

    it('should handle switcher button and theme button clicks', () => {
      const switcherBtn = document.createElement('div');
      switcherBtn.className = 'switcher-btn';
      const colorSwitcher = document.createElement('div');
      colorSwitcher.className = 'color-switcher';
      const themeBtn = document.createElement('div');
      themeBtn.className = 'theme-buttons';
      themeBtn.setAttribute('data-color', '#ff5722');

      document.body.appendChild(switcherBtn);
      document.body.appendChild(colorSwitcher);
      document.body.appendChild(themeBtn);

      component.ngOnInit();

      switcherBtn.click();
      expect(colorSwitcher.classList.contains('active')).toBeTrue();

      themeBtn.click();
      expect(mockCookieService.set).toHaveBeenCalledWith('theme-color', '#ff5722');

      // Cleanup
      document.body.removeChild(switcherBtn);
      document.body.removeChild(colorSwitcher);
      document.body.removeChild(themeBtn);
    });
  });
});
