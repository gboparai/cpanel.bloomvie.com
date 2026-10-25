import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LayoutComponent } from './layout.component';
import { ChatSocketService } from '../common-component/chatbox/chat-socket.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { CommonService } from '../common-component/common.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

describe('LayoutComponent', () => {
  let component: LayoutComponent;
  let fixture: ComponentFixture<LayoutComponent>;
  let mockChatService: jasmine.SpyObj<ChatSocketService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;

  beforeEach(async () => {
    mockChatService = jasmine.createSpyObj('ChatSocketService', ['startConnection', 'stopConnection']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'set']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['TokenMatchQueryParam']);

    await TestBed.configureTestingModule({
      imports: [LayoutComponent],
      providers: [
        { provide: ChatSocketService, useValue: mockChatService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: CookieService, useValue: mockCookieService },
        { provide: CommonService, useValue: mockCommonService },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({}),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(LayoutComponent, {
        set: {
          imports: [],
          providers: [{ provide: ChatSocketService, useValue: mockChatService }],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(LayoutComponent);
    component = fixture.componentInstance;
  });

  it('should create the layout component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with loading state true', () => {
    expect(component.isLoading).toBeTrue();
    expect(component.isHeaderLoad).toBeFalse();
    expect(component.isSideLoad).toBeFalse();
  });

  describe('Lifecycle hooks', () => {
    it('should start chat connection on ngOnInit', () => {
      component.ngOnInit();
      expect(mockChatService.startConnection).toHaveBeenCalled();
    });

    it('should stop chat connection on ngOnDestroy', () => {
      component.ngOnDestroy();
      expect(mockChatService.stopConnection).toHaveBeenCalled();
    });
  });

  describe('Loading coordination', () => {
    it('should not hide spinner if only header has loaded', () => {
      component.isComponentLoadinHeader(true);
      expect(component.isHeaderLoad).toBeTrue();
      expect(component.isLoading).toBeTrue();
    });

    it('should not hide spinner if only sidebar has loaded', () => {
      component.isComponentLoadinSideBar(true);
      expect(component.isSideLoad).toBeTrue();
      expect(component.isLoading).toBeTrue();
    });

    it('should hide spinner when both header and sidebar have loaded', () => {
      component.isComponentLoadinHeader(true);
      component.isComponentLoadinSideBar(true);
      expect(component.isLoading).toBeFalse();
    });
  });
});
